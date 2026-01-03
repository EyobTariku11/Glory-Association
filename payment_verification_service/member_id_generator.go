package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"time"
)

// generateMemberId generates a member ID based on GeneralCodes table
func generateMemberId(shortCode string, associationId []byte, db *sql.DB) (string, error) {
	associationIdStr := guidBytesToString(associationId)

	// Try to get GeneralCode for this association
	generalCodeQuery := `
		SELECT InitialName, CurrentNumber, Pad 
		FROM GeneralCodes 
		WHERE GeneralCodeType = 0 AND AssociationId = @p1
	`

	var initialName string
	var currentNumber int
	var pad int

	err := db.QueryRow(generalCodeQuery, associationIdStr).Scan(&initialName, &currentNumber, &pad)

	if err == nil {
		// Generate consecutive member ID
		currentNumber++
		consecutiveNumber := fmt.Sprintf("%0*d", pad, currentNumber)
		generatedId := fmt.Sprintf("%s-%s-%s", initialName, shortCode, consecutiveNumber)

		// Update the current number in GeneralCodes
		updateQuery := `
			UPDATE GeneralCodes 
			SET CurrentNumber = @p1
			WHERE GeneralCodeType = 0 AND AssociationId = @p2
		`
		_, err = db.Exec(updateQuery, currentNumber, associationIdStr)
		if err != nil {
			log.Printf("Error updating GeneralCode: %v", err)
		}

		// Check if ID already exists
		for isMemberIdExists(generatedId, db) {
			currentNumber++
			consecutiveNumber = fmt.Sprintf("%0*d", pad, currentNumber)
			generatedId = fmt.Sprintf("%s-%s-%s", initialName, shortCode, consecutiveNumber)

			// Update again
			_, err = db.Exec(updateQuery, currentNumber, associationIdStr)
			if err != nil {
				log.Printf("Error updating GeneralCode: %v", err)
			}
		}

		return generatedId, nil
	}

	// Fallback: Generate random member ID
	log.Printf("No GeneralCode found for association, generating random ID")
	rand.Seed(time.Now().UnixNano())

	// Try to get default GeneralCode
	defaultQuery := `
		SELECT InitialName, CurrentNumber, Pad 
		FROM GeneralCodes 
		WHERE GeneralCodeType = 0 AND AssociationId IS NULL
	`

	err = db.QueryRow(defaultQuery).Scan(&initialName, &currentNumber, &pad)
	if err != nil {
		// Use defaults if no GeneralCode exists
		initialName = "EPLFFC"
		pad = 8
	}

	// Generate random number
	maxNum := int64(1)
	for i := 0; i < pad; i++ {
		maxNum *= 10
	}

	var generatedId string
	for {
		randomNumber := rand.Int63n(maxNum)
		generatedId = fmt.Sprintf("%s-%s-%0*d", initialName, shortCode, pad, randomNumber)

		if !isMemberIdExists(generatedId, db) {
			break
		}
	}

	return generatedId, nil
}

// isMemberIdExists checks if a member ID already exists
func isMemberIdExists(memberId string, db *sql.DB) bool {
	query := `SELECT COUNT(*) FROM Members WHERE MemberId = @p1`
	var count int
	err := db.QueryRow(query, memberId).Scan(&count)
	if err != nil {
		return false
	}
	return count > 0
}
