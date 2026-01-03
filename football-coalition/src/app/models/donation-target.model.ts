export interface DonationTarget {
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

export interface CreateDonationForTargetRequest {
  targetId: string;
  donorName?: string;
  phoneNumber?: string;
  email?: string;
  amount: number;
  memberId?: string;
} 