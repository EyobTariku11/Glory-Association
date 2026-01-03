# Member Verification API & QR Code System

## Overview
This system allows coalition staff to verify membership by scanning QR codes on member ID cards. The QR code contains a direct link to the verification API endpoint.

## API Endpoint

### Verify Member
**GET** `/api/Member/VerifyMember?memberId={memberId}`

**Example:** `/api/Member/VerifyMember?memberId=COALITION-FTW-96902673`

**Response:**
```json
{
  "isVerified": true,
  "message": "Member verified successfully.",
  "data": {
    "id": "guid-here",
    "fullName": "John Doe",
    "memberId": "COALITION-FTW-96902673",
    "imagePath": "path/to/image.jpg",
    "email": "john@example.com",
    "phoneNumber": "+251912345678",
    "zone": "Zone A",
    "woreda": "Woreda 1",
    "birthDate": "1990-01-01T00:00:00",
    "membershipTypeName": "Premium",
    "associationName": "Addis Ababa Association",
    "coalitionName": "EPLFFC Coalition",
    "expiryDate": "2026-01-01T00:00:00",
    "paymentStatus": "ACTIVE",
    "isProfileCompleted": true,
    "createdDate": "2025-01-01T00:00:00"
  }
}
```

**Error Response:**
```json
{
  "isVerified": false,
  "message": "Member not found with the provided ID.",
  "data": null
}
```

## QR Code Implementation

### Frontend (coalition_membership_UI)
The QR code is generated in the `generate-id-card.component.html` and displays the verification API URL.

**QR Code Data Format:**
```
http://localhost:5267/api/Member/VerifyMember?memberId=COALITION-FTW-96902673
```

**Features:**
- Automatically generates verification URL using environment configuration
- Falls back to placeholder when member ID is not available
- Includes "Scan to verify membership" label
- Responsive design for different screen sizes

### Backend (coalition_membership_API)

#### DTOs Created:
1. **MemberVerificationDto** - Main response wrapper
2. **MemberVerificationDataDto** - Detailed member information

#### Service Method:
- **VerifyMemberById(string memberId)** - Core verification logic

#### Controller Endpoint:
- **VerifyMember** - HTTP GET endpoint for verification

## Usage Flow

1. **Member receives ID card** with QR code containing verification URL
2. **Staff scans QR code** using any QR code scanner app
3. **QR code opens verification URL** in browser or app
4. **API returns member details** if verification is successful
5. **Staff can verify** member identity, status, and details

## Security Considerations

- **Public Endpoint**: The verification endpoint is public (no authentication required)
- **Member ID Only**: Verification is based solely on the member ID
- **Read-Only**: No data modification is possible through this endpoint
- **Rate Limiting**: Consider implementing rate limiting for production use

## Testing

### Test the API:
```bash
curl "http://localhost:5267/api/Member/VerifyMember?memberId=COALITION-FTW-96902673"
```

### Test the QR Code:
1. Generate an ID card with a valid member ID
2. Scan the QR code with a mobile device
3. Verify the URL opens and returns member data

## Environment Configuration

The frontend uses environment configuration to construct the verification URL:

```typescript
// environment.ts
export const environment = {
  baseUrl: "http://localhost:5267/api",
  // ... other config
};

// generate-id-card.component.ts
getVerificationUrl(): string {
  if (!this.member?.memberId) return '';
  const apiUrl = environment.baseUrl;
  return `${apiUrl}/Member/VerifyMember?memberId=${this.member.memberId}`;
}
```

## Future Enhancements

1. **Authentication**: Add optional authentication for sensitive member data
2. **Audit Logging**: Track verification attempts and results
3. **Offline Support**: Cache member data for offline verification
4. **Mobile App**: Dedicated mobile app for staff verification
5. **Real-time Updates**: WebSocket notifications for membership status changes

## Troubleshooting

### Common Issues:

1. **QR Code Not Scanning**: Ensure member ID exists and is not null
2. **API Returns 404**: Check if the API is running and endpoint is correct
3. **CORS Issues**: Verify API CORS configuration for frontend domain
4. **Member Not Found**: Confirm member ID exists in database

### Debug Steps:

1. Check browser console for errors
2. Verify API endpoint is accessible
3. Confirm member ID format is correct
4. Check database for member existence 