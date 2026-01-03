package main

import (
	"bytes"
	"database/sql"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	_ "github.com/denisenkom/go-mssqldb"
	"github.com/joho/godotenv"
)

// Payment represents a payment record from the database
type Payment struct {
	ID                   []byte // Scan as binary GUID
	MemberId             []byte // Scan as binary GUID
	TransactionReference string
	PaymentUrl           string
	Amount               float64
	MembershipTypeId     []byte // Scan as binary GUID
	ExpiryDate           time.Time
	LastPaidDate         time.Time
	PaymentStatus        string
	ModifiedDate         time.Time
	IsPaid               bool
	CreatedDate          time.Time
	CreatedById          *string
	RowStatus            int
}

// ArifPayResponse represents the response from ArifPay API
type ArifPayResponse struct {
	Error bool        `json:"error"`
	Msg   string      `json:"msg"`
	Data  ArifPayData `json:"data"`
}

type ArifPayData struct {
	TransactionStatus string  `json:"transactionStatus,omitempty"`
	TransactionId     *string `json:"transactionId,omitempty"`
	SessionId         *string `json:"sessionId,omitempty"`
}

// Config holds application configuration
type Config struct {
	DbConnectionString string
	SmsApiUrl          string
	SmsToken           string
	ApiBaseUrl         string
	CheckInterval      int // minutes
}

var config Config

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load configuration
	loadConfig()

	log.Println("Payment Verification Service Starting...")
	log.Printf("Checking interval: %d minutes", config.CheckInterval)

	// Start the verification loop
	ticker := time.NewTicker(time.Duration(config.CheckInterval) * time.Minute)
	defer ticker.Stop()

	// Run immediately on startup
	log.Println("Running initial check...")
	checkAndProcessPayments()

	// Run periodic checks
	for {
		select {
		case <-ticker.C:
			log.Println("Running scheduled check...")
			checkAndProcessPayments()
		}
	}
}

func loadConfig() {
	config.DbConnectionString = getEnv("DB_CONNECTION_STRING",
		"server=196.190.251.48;user id=sa;password=DAFTech@2024;database=CoalitionMembership;port=1433;")
	config.SmsApiUrl = getEnv("SMS_API_URL", "https://api.geezsms.com/api/v1/sms/send")
	config.SmsToken = getEnv("SMS_TOKEN", "iZElUoYIHoGUYJpTj00mODa0GrNcgtKN")
	config.ApiBaseUrl = getEnv("API_BASE_URL", "http://localhost:5000/api")
	config.CheckInterval = getEnvAsInt("CHECK_INTERVAL_MINUTES", 2)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func checkAndProcessPayments() {
	// Connect to database
	db, err := sql.Open("sqlserver", config.DbConnectionString)
	if err != nil {
		log.Printf("Error connecting to database: %v", err)
		return
	}
	defer db.Close()

	// Get pending payments
	payments, err := getPendingPayments(db)
	if err != nil {
		log.Printf("Error fetching pending payments: %v", err)
		return
	}

	log.Printf("Found %d pending payments", len(payments))

	// Process each payment
	for _, payment := range payments {
		processPayment(payment, db)
	}
}

func getPendingPayments(db *sql.DB) ([]Payment, error) {
	query := `
		SELECT Id, MemberId, TransactionReference, PaymentUrl, Amount, 
			MembershipTypeId, ExpiryDate, LastPaidDate, PaymentStatus, 
			ModifiedDate, IsPaid, CreatedDate, CreatedById, RowStatus
		FROM MemberPayments
		WHERE PaymentStatus = 0
		  AND CreatedDate >= DATEADD(HOUR, -24, GETDATE())
		ORDER BY CreatedDate DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []Payment
	for rows.Next() {
		var payment Payment
		err := rows.Scan(
			&payment.ID, &payment.MemberId, &payment.TransactionReference,
			&payment.PaymentUrl, &payment.Amount, &payment.MembershipTypeId,
			&payment.ExpiryDate, &payment.LastPaidDate, &payment.PaymentStatus,
			&payment.ModifiedDate, &payment.IsPaid, &payment.CreatedDate,
			&payment.CreatedById, &payment.RowStatus,
		)
		if err != nil {
			log.Printf("Error scanning payment: %v", err)
			continue
		}
		payments = append(payments, payment)
	}

	return payments, nil
}

func processPayment(payment Payment, db *sql.DB) {
	paymentIdStr := guidBytesToString(payment.ID)
	log.Printf("Processing payment: %s (Transaction: %s)", paymentIdStr, payment.TransactionReference)

	// Get ArifPay API key from Association via MembershipType
	arifPayKey, err := getArifPayKeyFromMembershipType(payment.MembershipTypeId, db)
	if err != nil {
		log.Printf("Error getting ArifPay key for payment %s: %v", paymentIdStr, err)
		return
	}

	// Check payment status with ArifPay
	arifPayStatus, err := checkArifPayStatus(payment.TransactionReference, arifPayKey)
	if err != nil {
		log.Printf("Error checking ArifPay status for payment %s: %v", paymentIdStr, err)
		// If error or transaction not found, mark as expired
		log.Printf("Marking payment %s as expired due to error", paymentIdStr)
		handleExpiredPayment(payment, db)
		return
	}

	// Handle API errors (like 404 - Transaction not found)
	if arifPayStatus.Error {
		log.Printf("ArifPay API error for payment %s: %s", paymentIdStr, arifPayStatus.Msg)
		// If transaction not found, mark as expired
		handleExpiredPayment(payment, db)
		return
	}

	log.Printf("Payment %s status: %s", payment.TransactionReference, arifPayStatus.Data.TransactionStatus)

	switch arifPayStatus.Data.TransactionStatus {
	case "SUCCESS":
		handleSuccessfulPayment(payment, db)
	case "PENDING":
		log.Printf("Payment %s still pending", paymentIdStr)
		// No action needed
	case "FAILED", "CANCELED", "EXPIRED", "UNAUTHORIZED", "FORBIDDEN", "":
		// Empty status also means expired/not found
		handleExpiredPayment(payment, db)
	default:
		log.Printf("Unknown status for payment %s: %s", paymentIdStr, arifPayStatus.Data.TransactionStatus)
		// Unknown status also marks as expired
		handleExpiredPayment(payment, db)
	}
}

// guidBytesToString converts binary GUID to string format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
func guidBytesToString(guidBytes []byte) string {
	if len(guidBytes) != 16 {
		// If not 16 bytes, return hex representation
		return hex.EncodeToString(guidBytes)
	}

	// Convert to standard GUID format
	// MS SQL Server stores GUIDs in mixed-endian format: Data1-DDCC-BBAA-EEEE-EEEE-EEEE-EEEE
	// We need to reorder the bytes for the string representation
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		binary.LittleEndian.Uint32(guidBytes[0:4]), // Data1
		binary.LittleEndian.Uint16(guidBytes[4:6]), // Data2
		binary.LittleEndian.Uint16(guidBytes[6:8]), // Data3
		binary.BigEndian.Uint16(guidBytes[8:10]),   // Data4[0:2]
		binary.BigEndian.Uint64([]byte{0, 0, guidBytes[10], guidBytes[11], guidBytes[12], guidBytes[13], guidBytes[14], guidBytes[15]}), // Data4[2:8]
	)
}

func getArifPayKeyFromMembershipType(membershipTypeId []byte, db *sql.DB) (string, error) {
	// Convert binary GUID to string
	guidStr := guidBytesToString(membershipTypeId)

	// Debug: log the membership type ID
	log.Printf("Looking up ArifPay key for MembershipTypeId: %s", guidStr)

	// Query with GUID string
	query := `
		SELECT a.ArifPayKey
		FROM MembershipTypes mt
		INNER JOIN Associations a ON mt.AssociationId = a.Id
		WHERE mt.Id = @p1
	`

	var arifPayKey string
	err := db.QueryRow(query, guidStr).Scan(&arifPayKey)
	if err != nil {
		return "", fmt.Errorf("failed to get ArifPay key for membership type %s: %v", guidStr, err)
	}

	return arifPayKey, nil
}

func checkArifPayStatus(transactionReference string, arifPayKey string) (ArifPayResponse, error) {
	url := fmt.Sprintf("https://gateway.arifpay.net/api/ms/transaction/status/%s", transactionReference)

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return ArifPayResponse{}, err
	}

	log.Println(arifPayKey)

	req.Header.Set("Accept", "application/json")
	req.Header.Set("x-arifpay-key", arifPayKey)

	resp, err := client.Do(req)
	if err != nil {
		return ArifPayResponse{}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ArifPayResponse{}, err
	}

	// Log raw response for debugging
	log.Printf("ArifPay API Response (status %d): %s", resp.StatusCode, string(body))

	var arifPayResp ArifPayResponse
	err = json.Unmarshal(body, &arifPayResp)
	if err != nil {
		log.Printf("Error unmarshaling ArifPay response: %v", err)
		log.Printf("Response body: %s", string(body))
		return ArifPayResponse{}, err
	}

	return arifPayResp, nil
}

func handleSuccessfulPayment(payment Payment, db *sql.DB) {
	var err error
	paymentIdStr := guidBytesToString(payment.ID)
	memberIdStr := guidBytesToString(payment.MemberId)
	log.Printf("Processing successful payment for %s", paymentIdStr)

	// Get member and membership type details for SMS/Email
	memberQuery := `
		SELECT m.FullName, m.PhoneNumber, m.Email, m.MemberId, mt.ShortCode, mt.Name as MembershipTypeName, mt.AssociationId
		FROM Members m
		INNER JOIN MembershipTypes mt ON m.MembershipTypeId = mt.Id
		WHERE m.Id = @p1
	`

	var memberDetails struct {
		FullName           *string // Make nullable
		PhoneNumber        *string // Make nullable
		Email              *string // Make nullable
		MemberId           *string // Make nullable
		ShortCode          string
		MembershipTypeName string
		AssociationId      []byte // Add AssociationId
	}

	err = db.QueryRow(memberQuery, memberIdStr).Scan(
		&memberDetails.FullName,
		&memberDetails.PhoneNumber,
		&memberDetails.Email,
		&memberDetails.MemberId,
		&memberDetails.ShortCode,
		&memberDetails.MembershipTypeName,
		&memberDetails.AssociationId,
	)

	if err != nil {
		log.Printf("Error fetching member details: %v", err)
		return
	}

	// Generate member ID if null or empty
	memberIdForSMS := ""
	if memberDetails.MemberId == nil || *memberDetails.MemberId == "" {
		log.Printf("Generating member ID for member")
		generatedId, err := generateMemberId(memberDetails.ShortCode, memberDetails.AssociationId, db)
		if err != nil {
			log.Printf("Error generating member ID: %v", err)
		} else {
			memberIdForSMS = generatedId

			// Update member with generated ID
			updateMemberQuery := `
				UPDATE Members 
				SET MemberId = @p1
				WHERE Id = @p2
			`
			_, err = db.Exec(updateMemberQuery, generatedId, memberIdStr)
			if err != nil {
				log.Printf("Error updating member ID: %v", err)
			} else {
				log.Printf("Updated member with ID: %s", generatedId)
			}
		}
	} else {
		memberIdForSMS = *memberDetails.MemberId
	}

	// Check if this is a renewal or new membership
	var isRenewal bool
	renewalQuery := `
		SELECT COUNT(*) 
		FROM MemberPayments 
		WHERE MemberId = @p1 AND PaymentStatus = 2
	`
	err = db.QueryRow(renewalQuery, memberIdStr).Scan(&isRenewal)
	if err != nil {
		isRenewal = false
	}

	// Create a copy for SMS (with the updated member ID and null checks)
	memberDetailsForSMS := struct {
		FullName           string
		PhoneNumber        string
		Email              string
		MemberId           string
		ShortCode          string
		MembershipTypeName string
	}{
		FullName:           getStringValue(memberDetails.FullName),
		PhoneNumber:        getStringValue(memberDetails.PhoneNumber),
		Email:              getStringValue(memberDetails.Email),
		MemberId:           memberIdForSMS,
		ShortCode:          memberDetails.ShortCode,
		MembershipTypeName: memberDetails.MembershipTypeName,
	}

	// Send SMS notification with correct member ID
	sendPaymentConfirmationSMS(&memberDetailsForSMS, payment, isRenewal, memberIdForSMS != "")

	// NOW update payment status to PAID (after generating ID and sending SMS)
	updateQuery := `
		UPDATE MemberPayments 
		SET PaymentStatus = 1, IsPaid = 1, ModifiedDate = GETDATE()
		WHERE Id = @p1
	`

	_, err = db.Exec(updateQuery, paymentIdStr)
	if err != nil {
		log.Printf("Error updating payment status: %v", err)
		return
	}

	log.Printf("Updated payment %s to PAID status", paymentIdStr)
}

// Helper function to safely get string value from pointer
func getStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func handleExpiredPayment(payment Payment, db *sql.DB) {
	paymentIdStr := guidBytesToString(payment.ID)
	log.Printf("Processing expired payment for %s", paymentIdStr)

	// Update payment status to EXPIRED
	updateQuery := `
		UPDATE MemberPayments 
		SET PaymentStatus = 2, ModifiedDate = GETDATE()
		WHERE Id = @p1
	`

	_, err := db.Exec(updateQuery, paymentIdStr)
	if err != nil {
		log.Printf("Error updating payment status: %v", err)
		return
	}

	log.Printf("Updated payment %s to EXPIRED status", paymentIdStr)
}

func sendPaymentConfirmationSMS(memberDetails *struct {
	FullName           string
	PhoneNumber        string
	Email              string
	MemberId           string
	ShortCode          string
	MembershipTypeName string
}, payment Payment, isRenewal bool, isNewMember bool) {
	expiryDate := payment.ExpiryDate.Format("January 02, 2006")

	var message string
	if isRenewal {
		// Renewal message
		message = fmt.Sprintf("Congratulation %s, your EPLFFC Membership has been successfully renewed!\nWe have received your payment and would like to thank you for continuing to be a valued member of the EPLFFC Association.\nYour renewed Membership ID is %s, valid until %s. You can log in through https://eplffc.et using your Membership ID.",
			memberDetails.FullName, memberDetails.MemberId, expiryDate)
	} else if isNewMember {
		// New membership message (member ID was just generated)
		message = fmt.Sprintf("Congratulation %s, being EPLFFC Member!!!\nWe have received your payment and would like to thank you for \n being a member of EPLFFC Association. \nYour Membership ID is %s you can login through https://eplffc.et/admin/auth/membership-login/%s using the provided membership Id.",
			memberDetails.FullName, memberDetails.MemberId, memberDetails.MemberId)
	} else {
		// Existing member payment
		message = fmt.Sprintf("Congratulation %s, your EPLFFC Membership payment has been received!\nWe have received your payment and would like to thank you for becoming a member of the EPLFFC Association.\nYour Membership ID is %s, valid until %s. You can log in through https://eplffc.et using your Membership ID.",
			memberDetails.FullName, memberDetails.MemberId, expiryDate)
	}

	err := sendSMS(memberDetails.PhoneNumber, message)
	if err != nil {
		log.Printf("Error sending SMS: %v", err)
	} else {
		log.Printf("SMS sent successfully to %s", memberDetails.PhoneNumber)
	}
}

func sendSMS(phoneNumber, smsMessage string) error {
	// Create form data
	values := url.Values{}
	values.Set("phone", phoneNumber)
	values.Set("msg", smsMessage)
	values.Set("token", config.SmsToken)

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	req, err := http.NewRequest("POST", config.SmsApiUrl, bytes.NewBufferString(values.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("SMS API error: Status %d, Body: %s", resp.StatusCode, string(body))
		return fmt.Errorf("SMS API returned status %d", resp.StatusCode)
	}

	return nil
}

func callConfirmationAPI(memberId string, transactionReference string) {
	url := fmt.Sprintf("%s/payment/confirm/%s", config.ApiBaseUrl, transactionReference)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Printf("Error creating confirmation request: %v", err)
		return
	}

	req.Header.Set("Accept", "application/json")

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error calling confirmation API: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		log.Printf("Successfully confirmed payment for transaction %s", transactionReference)
	} else {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Confirmation API returned status %d: %s", resp.StatusCode, string(body))
	}
}
