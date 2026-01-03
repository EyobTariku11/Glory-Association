using MembershipInfrustructure.Model.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.DTOS.Users
{

    public record FilterCriteriaDto
    {
        public string? AssociationId { get; set; }
        public string? RegionId { get; set; }
        public string? Gender { get; set; }
        public string? PaymentStatus { get; set; }
    }
    
    public record DashboardNumericalDTo
    {
        public int TotalMembers { get; set; }
        public int PendingMembers { get; set; }
        public double Revenue { get; set; }
        public double Receivable { get; set; }
    }

    // New DTOs for enhanced dashboard system
    public record CoalitionOverviewDto
    {
        public int TotalAssociations { get; set; }
        public int TotalMembers { get; set; }
        public int TotalPendingMembers { get; set; }
        public double TotalRevenue { get; set; }
        public double TotalReceivable { get; set; }
        public List<AssociationSummaryDto> AssociationSummaries { get; set; } = new();
        public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
        public List<GenderDistributionDto> GenderDistribution { get; set; } = new();
        public List<PaymentStatusDistributionDto> PaymentStatusDistribution { get; set; } = new();
    }

    public record AssociationSummaryDto
    {
        public Guid AssociationId { get; set; }
        public string AssociationName { get; set; } = string.Empty;
        public int TotalMembers { get; set; }
        public int PendingMembers { get; set; }
        public double Revenue { get; set; }
        public double Receivable { get; set; }
        public DateTime LastActivity { get; set; }
    }

    public record AssociationDashboardDto
    {
        public Guid AssociationId { get; set; }
        public string AssociationName { get; set; } = string.Empty;
        public DashboardNumericalDTo Metrics { get; set; } = new();
        public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();
        public List<GenderDistributionDto> GenderDistribution { get; set; } = new();
        public List<PaymentStatusDistributionDto> PaymentStatusDistribution { get; set; } = new();
        public List<MembershipTypeDistributionDto> MembershipTypeDistribution { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public record MonthlyTrendDto
    {
        public string Month { get; set; } = string.Empty;
        public int NewMembers { get; set; }
        public double Revenue { get; set; }
        public int Year { get; set; }
    }

    public record GenderDistributionDto
    {
        public string Gender { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public record PaymentStatusDistributionDto
    {
        public string PaymentStatus { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public record MembershipTypeDistributionDto
    {
        public string MembershipType { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public record RecentActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string MemberName { get; set; } = string.Empty;
    }

    public record ReportRequestDto
    {
        public string Scope { get; set; } = string.Empty; // "coalition" or "association"
        public Guid? AssociationId { get; set; }
        public string ReportType { get; set; } = string.Empty; // "overview", "detailed", "financial", etc.
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Format { get; set; } = "json"; // "json", "pdf", "excel"
    }

    public record ReportResponseDto
    {
        public string ReportType { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public object Data { get; set; } = new();
        public string? DownloadUrl { get; set; }
    }
}
