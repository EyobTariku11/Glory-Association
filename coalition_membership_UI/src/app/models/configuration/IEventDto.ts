export interface EventPostDto {
  title: string;
  subTitle?: string;
  description: string;
  imageFile?: File;
  eventDate: Date;
  endDate?: Date;
  location: string;
  eventType?: string;
  isDonationEnabled: boolean;
  targetAmount?: number;
  associationId: string;
}

export interface EventGetDto {
  id: string;
  title: string;
  subTitle?: string;
  description: string;
  imagePath?: string;
  eventDate: Date;
  endDate?: Date;
  location: string;
  eventType?: string;
  isDonationEnabled: boolean;
  targetAmount?: number;
  amountCollected?: number;
  isApproved: boolean;
  approvedDate?: Date;
  approvedById?: string;
  associationId: string;
  associationName: string;
  associationLogoPath?: string;
  createdDate: Date;
  createdById?: string;
}

export interface EventDonationPostDto {
  eventId: string;
  donorName?: string;
  phoneNumber?: string;
  email?: string;
  amount: number;
  memberId?: string;
}

export interface EventDonationGetDto {
  id: string;
  eventId: string;
  eventTitle: string;
  donorName?: string;
  phoneNumber?: string;
  email?: string;
  amount: number;
  transactionReference: string;
  isPaid: boolean;
  paymentDate?: Date;
  memberId?: string;
  memberName?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdDate: Date;
  createdById?: string;
} 