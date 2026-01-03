import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface MemberVerificationResponse {
  isVerified: boolean;
  message: string;
  data: {
    id: string;
    fullName: string;
    memberId: string;
    imagePath: string;
    email: string;
    phoneNumber: string;
    zone: string;
    woreda: string;
    birthDate: string;
    membershipTypeName: string;
    associationName: string;
    coalitionName: string;
    expiryDate: string;
    paymentStatus: string;
    isProfileCompleted: boolean;
    createdDate: string;
  } | null;
}

@Component({
  selector: 'app-member-verification',
  templateUrl: './member-verification.component.html',
  styleUrls: ['./member-verification.component.scss']
})
export class MemberVerificationComponent implements OnInit {
  memberId: string = '';
  verificationResult: MemberVerificationResponse | null = null;
  isLoading: boolean = false;
  error: string = '';
  isExpired: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Get member ID from route parameter
    this.route.params.subscribe(params => {
      this.memberId = params['memberId'];
      if (this.memberId) {
        this.verifyMember(this.memberId);
      }
    });
  }

  verifyMember(memberId: string): void {
    this.isLoading = true;
    this.error = '';
    this.verificationResult = null;

    // Make API request to EPLFFC verification endpoint
    const apiUrl = `https://eplffc.et/api/api/Member/VerifyMember?memberId=${memberId}`;
    
    this.http.get<MemberVerificationResponse>(apiUrl).subscribe({
      next: (response) => {
        this.verificationResult = response;
        this.isLoading = false;
        
        // Check if membership is expired
        if (response.data && response.data.expiryDate) {
          const expiryDate = new Date(response.data.expiryDate);
          const currentDate = new Date();
          this.isExpired = expiryDate < currentDate;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Failed to verify member. Please try again.';
        console.error('Verification error:', error);
      }
    });
  }

  getMemberImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `https://eplffc.et/${imagePath}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'PAID':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'EXPIRED':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  goBack(): void {
    this.router.navigate(['/football-coalition']);
  }
} 