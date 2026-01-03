export interface DonationTargetPostDto {
  title: string;
  description: string;
  targetAmount: number;
  eventId?: string;
  associationId?: string; // Optional - will be set by API from JWT token
}

export interface DonationTargetGetDto {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  amountCollected?: number;
  associationId: string;
  associationName: string;
  associationLogoPath?: string;
  eventId?: string;
  eventTitle?: string;
  isActive: boolean;
  isApproved: boolean;
  approvedDate?: Date;
  approvedById?: string;
  progressPercentage: number;
  createdDate: Date;
  createdById: string;
} 