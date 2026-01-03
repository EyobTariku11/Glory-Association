# Payment Verification Service

A Go-based background service that automatically checks pending payments every 2 minutes and verifies their status with ArifPay payment gateway.

## Features

- 🔄 Automatic payment status checking every 2 minutes
- ✅ Verifies payments with ArifPay API
- 📧 Sends SMS notifications on successful payments
- 📊 Updates payment status in database
- 🔍 Distinguishes between new and renewal memberships
- ⚙️ Runs as a systemd service with automatic restart

## Architecture

The service:
1. Connects to SQL Server database
2. Queries pending payments
3. Verifies status with ArifPay API using transaction reference
4. Updates payment status based on response:
   - **SUCCESS** → Sets to PAID, sends SMS, calls C# API for full confirmation
   - **PENDING** → No action
   - **FAILED/CANCELED/EXPIRED/UNAUTHORIZED/FORBIDDEN** → Sets to EXPIRED

## Configuration

The service reads configuration from environment variables:

```bash
DB_CONNECTION_STRING=server=196.190.251.48;user id=sa;password=DAFTech@2024;database=CoalitionMembership;port=1433;
SMS_API_URL=https://api.geezsms.com/api/v1/sms/send
SMS_TOKEN=iZElUoYIHoGUYJpTj00mODa0GrNcgtKN
API_BASE_URL=http://localhost:5000/api
CHECK_INTERVAL_MINUTES=2
```

## Deployment

### Option 1: Using Deployment Script (Recommended)

```bash
cd payment_verification_service
./deploy.sh
```

The script will:
1. Build the Go binary for Linux
2. Transfer to the server
3. Create systemd service
4. Start the service

### Option 2: Manual Deployment

1. Build the binary:
```bash
GOOS=linux GOARCH=amd64 go build -o payment-verification-service main.go
```

2. Copy to server:
```bash
scp payment-verification-service timret@196.190.251.48:/opt/payment-verification-service/
```

3. Create systemd service:
```bash
sudo tee /etc/systemd/system/payment-verification-service.service > /dev/null << 'EOF'
[Unit]
Description=Payment Verification Service
After=network.target

[Service]
Type=simple
User=timret
WorkingDirectory=/opt/payment-verification-service
ExecStart=/opt/payment-verification-service/payment-verification-service
Restart=always

Environment=DB_CONNECTION_STRING="server=196.190.251.48;user id=sa;password=DAFTech@2024;database=CoalitionMembership;port=1433;"
Environment=SMS_API_URL="https://api.geezsms.com/api/v1/sms/send"
Environment=SMS_TOKEN="iZElUoYIHoGUYJpTj00mODa0GrNcgtKN"
Environment=API_BASE_URL="http://localhost:5000/api"
Environment=CHECK_INTERVAL_MINUTES=2

StandardOutput=append:/opt/payment-verification-service/logs/payment-verification.log
StandardError=append:/opt/payment-verification-service/logs/payment-verification-error.log

[Install]
WantedBy=multi-user.target
EOF
```

4. Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable payment-verification-service
sudo systemctl start payment-verification-service
```

## Service Management

On the server:

```bash
# Check status
sudo systemctl status payment-verification-service

# View logs
tail -f /opt/payment-verification-service/logs/payment-verification.log

# Restart service
sudo systemctl restart payment-verification-service

# Stop service
sudo systemctl stop payment-verification-service
```

## SMS Notifications

The service sends different SMS messages based on membership type:

### New Membership
```
Congratulation [Name], your EPLFFC Membership payment has been received!
We have received your payment and would like to thank you for becoming a member of the EPLFFC Association.
Your Membership ID is [MemberId], valid until [ExpiryDate]. You can log in through https://eplffc.et using your Membership ID.
```

### Renewal
```
Congratulation [Name], your EPLFFC Membership has been successfully renewed!
We have received your payment and would like to thank you for continuing to be a valued member of the EPLFFC Association.
Your renewed Membership ID is [MemberId], valid until [ExpiryDate]. You can log in through https://eplffc.et using your Membership ID.
```

## Database Queries

The service queries the following table:

```sql
SELECT TOP 1000
    Id, MemberId, TransactionReference, PaymentUrl, Amount, 
    MembershipTypeId, ExpiryDate, LastPaidDate, PaymentStatus, 
    ModifiedDate, IsPaid, CreatedDate, CreatedById, RowStatus
FROM MemberPayments
WHERE PaymentStatus = 'PENDING'
ORDER BY CreatedDate DESC
```

## ArifPay Integration

The service calls the ArifPay API to verify transaction status:

```
GET https://gateway.arifpay.net/api/ms/transaction/status/{TransactionReference}
```

Expected response:
```json
{
    "error": false,
    "msg": "No Errors",
    "data": {
        "transactionStatus": "SUCCESS",
        "transactionId": "CJI0JLREZ4",
        "sessionId": "823FE11AD4060D"
    }
}
```

## Troubleshooting

### Service not starting
```bash
# Check logs
sudo journalctl -u payment-verification-service -f

# Check service file
sudo systemctl status payment-verification-service
```

### Database connection issues
- Verify connection string
- Check firewall rules
- Test connection manually

### SMS not sending
- Verify SMS API credentials
- Check SMS token
- Review SMS provider logs

## Development

### Local Testing

```bash
# Install dependencies
go mod download

# Run locally
go run main.go

# Build for current platform
go build -o payment-verification-service main.go
```

## Files

- `main.go` - Main service implementation
- `go.mod` - Go module dependencies
- `deploy.sh` - Deployment script
- `.env.example` - Configuration template

## Dependencies

- `github.com/denisenkom/go-mssqldb` - SQL Server driver
- `github.com/joho/godotenv` - Environment variable loading

