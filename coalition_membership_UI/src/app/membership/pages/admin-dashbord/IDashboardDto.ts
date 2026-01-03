export interface DashboardNumericalDTo {
  totalMembers: number;
  pendingMembers: number;
  revenue: number;
  receivable: number;
}

export interface FilterCriteriaDto {
  associationId?: string;
  regionId?: string;
  gender: string;
  paymentStatus: string;
}

// New DTOs for enhanced dashboard system
export interface CoalitionOverviewDto {
  totalAssociations: number;
  totalMembers: number;
  totalPendingMembers: number;
  totalRevenue: number;
  totalReceivable: number;
  associationSummaries: AssociationSummaryDto[];
  monthlyTrends: MonthlyTrendDto[];
  genderDistribution: GenderDistributionDto[];
  paymentStatusDistribution: PaymentStatusDistributionDto[];
}

export interface AssociationSummaryDto {
  associationId: string;
  associationName: string;
  totalMembers: number;
  pendingMembers: number;
  revenue: number;
  receivable: number;
  lastActivity: string;
}

export interface AssociationDashboardDto {
  associationId: string;
  associationName: string;
  metrics: DashboardNumericalDTo;
  monthlyTrends: MonthlyTrendDto[];
  genderDistribution: GenderDistributionDto[];
  paymentStatusDistribution: PaymentStatusDistributionDto[];
  membershipTypeDistribution: MembershipTypeDistributionDto[];
  recentActivities: RecentActivityDto[];
}

export interface MonthlyTrendDto {
  month: string;
  newMembers: number;
  revenue: number;
  year: number;
}

export interface GenderDistributionDto {
  gender: string;
  count: number;
  percentage: number;
}

export interface PaymentStatusDistributionDto {
  paymentStatus: string;
  count: number;
  percentage: number;
}

export interface MembershipTypeDistributionDto {
  membershipType: string;
  count: number;
  percentage: number;
}

export interface RecentActivityDto {
  activityType: string;
  description: string;
  timestamp: string;
  memberName: string;
}

export interface ReportRequestDto {
  scope: string;
  associationId?: string;
  reportType: string;
  startDate?: string;
  endDate?: string;
  format?: string;
}

export interface ReportResponseDto {
  reportType: string;
  scope: string;
  generatedAt: string;
  data: any;
  downloadUrl?: string;
}

export interface ReportTypeDto {
  scope: string;
  type: string;
  description: string;
}
