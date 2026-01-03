using MembershipImplementation.DTOS.Users;
using MembershipImplementation.Interfaces.Users;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Users;
using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Authentication;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.Services.Users
{
    public class DashboardService : IDashboardService
    {
        public readonly ApplicationDbContext _dbContext;

        public DashboardService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<DashboardNumericalDTo> GetNumbericalData(FilterCriteriaDto filterCriteria)
        {
            try
            {
                DashboardNumericalDTo dashboardNumericalDTo = new DashboardNumericalDTo();

                // Build base query for members
                var memberQuery = _dbContext.Members.Include(m => m.MembershipType).AsQueryable();
                if (filterCriteria.AssociationId != null && filterCriteria.AssociationId.ToLower() != "all")
                {
                    memberQuery = memberQuery.Where(m => m.MembershipType.AssociationId == Guid.Parse(filterCriteria.AssociationId));
                }
                else if (filterCriteria.RegionId != null && filterCriteria.RegionId.ToLower() != "all")
                {
                    memberQuery = memberQuery.Where(m => m.RegionId == Guid.Parse(filterCriteria.RegionId));
                }
                if (filterCriteria.Gender != null && filterCriteria.Gender.ToLower() != "all")
                {
                    memberQuery = memberQuery.Where(m => m.Gender == Enum.Parse<Gender>(filterCriteria.Gender));
                }

                // Calculate Total Members
                dashboardNumericalDTo.TotalMembers = await memberQuery.CountAsync();

                // Build base query for payments
                var paymentQuery = _dbContext.MemberPayments.Include(mp => mp.Member.MembershipType).AsQueryable();
                if (filterCriteria.AssociationId != null && filterCriteria.AssociationId.ToLower() != "all")
                {
                    paymentQuery = paymentQuery.Where(mp => mp.Member.MembershipType.AssociationId == Guid.Parse(filterCriteria.AssociationId));
                }
                else if (filterCriteria.RegionId != null && filterCriteria.RegionId.ToLower() != "all")
                {
                    paymentQuery = paymentQuery.Where(mp => mp.Member.RegionId == Guid.Parse(filterCriteria.RegionId));
                }
                if (filterCriteria.Gender != null && filterCriteria.Gender.ToLower() != "all")
                {
                    paymentQuery = paymentQuery.Where(mp => mp.Member.Gender == Enum.Parse<Gender>(filterCriteria.Gender));
                }
                if (filterCriteria.PaymentStatus != null && filterCriteria.PaymentStatus.ToLower() != "all")
                {
                    paymentQuery = paymentQuery.Where(mp => mp.PaymentStatus == Enum.Parse<PaymentStatus>(filterCriteria.PaymentStatus));
                }

                // Calculate Pending Members
                dashboardNumericalDTo.PendingMembers = await paymentQuery
                    .Where(mp => mp.PaymentStatus == PaymentStatus.PENDING)
                    .GroupBy(mp => mp.MemberId)
                    .CountAsync();

                // Calculate Revenue (Assuming Revenue is total of all successful payments)
                dashboardNumericalDTo.Revenue = await paymentQuery
                    .Where(mp => mp.IsPaid)
                    .SumAsync(mp => mp.Amount);

                // Calculate Receivable (Assuming Receivable is total of all pending payments)
                dashboardNumericalDTo.Receivable = await paymentQuery
                    .Where(mp => mp.PaymentStatus == PaymentStatus.PENDING)
                    .SumAsync(mp => mp.Amount);

                return dashboardNumericalDTo;
            }
            catch (Exception ex)
            {
                return new DashboardNumericalDTo();
            }
        }

        public async Task<CoalitionOverviewDto> GetCoalitionOverviewAsync()
        {
            try
            {
                var overview = new CoalitionOverviewDto();

                // Get total associations
                overview.TotalAssociations = await _dbContext.Associations.CountAsync();

                // Get overall metrics
                overview.TotalMembers = await _dbContext.Members.CountAsync();
                overview.TotalPendingMembers = await _dbContext.MemberPayments
                    .Where(mp => mp.PaymentStatus == PaymentStatus.PENDING)
                    .GroupBy(mp => mp.MemberId)
                    .CountAsync();
                overview.TotalRevenue = await _dbContext.MemberPayments
                    .Where(mp => mp.IsPaid)
                    .SumAsync(mp => mp.Amount);
                overview.TotalReceivable = await _dbContext.MemberPayments
                    .Where(mp => mp.PaymentStatus == PaymentStatus.PENDING)
                    .SumAsync(mp => mp.Amount);

                // Get association summaries
                overview.AssociationSummaries = await GetAssociationSummariesAsync();

                // Get monthly trends for the last 12 months
                overview.MonthlyTrends = await GetMonthlyTrendsAsync(null);

                // Get gender distribution
                overview.GenderDistribution = await GetGenderDistributionAsync(null);

                // Get payment status distribution
                overview.PaymentStatusDistribution = await GetPaymentStatusDistributionAsync(null);

                return overview;
            }
            catch (Exception ex)
            {
                return new CoalitionOverviewDto();
            }
        }

        public async Task<AssociationDashboardDto> GetAssociationDashboardAsync(Guid associationId)
        {
            try
            {
                var dashboard = new AssociationDashboardDto
                {
                    AssociationId = associationId
                };

                // Get association name
                var association = await _dbContext.Associations
                    .FirstOrDefaultAsync(a => a.Id == associationId);
                dashboard.AssociationName = association?.Name ?? "Unknown Association";

                // Get metrics for this association
                var filterCriteria = new FilterCriteriaDto
                {
                    AssociationId = associationId.ToString()
                };
                dashboard.Metrics = await GetNumbericalData(filterCriteria);

                // Get monthly trends for this association
                dashboard.MonthlyTrends = await GetMonthlyTrendsAsync(associationId);

                // Get gender distribution for this association
                dashboard.GenderDistribution = await GetGenderDistributionAsync(associationId);

                // Get payment status distribution for this association
                dashboard.PaymentStatusDistribution = await GetPaymentStatusDistributionAsync(associationId);

                // Get membership type distribution for this association
                dashboard.MembershipTypeDistribution = await GetMembershipTypeDistributionAsync(associationId);

                // Get recent activities for this association
                dashboard.RecentActivities = await GetRecentActivitiesAsync(associationId);

                return dashboard;
            }
            catch (Exception ex)
            {
                return new AssociationDashboardDto();
            }
        }

        public async Task<ReportResponseDto> GenerateReportAsync(ReportRequestDto request)
        {
            try
            {
                var report = new ReportResponseDto
                {
                    ReportType = request.ReportType,
                    Scope = request.Scope,
                    GeneratedAt = DateTime.UtcNow
                };

                switch (request.Scope.ToLower())
                {
                    case "coalition":
                        if (request.ReportType.ToLower() == "overview")
                        {
                            report.Data = await GetCoalitionOverviewAsync();
                        }
                        break;

                    case "association":
                        if (request.AssociationId.HasValue)
                        {
                            if (request.ReportType.ToLower() == "dashboard")
                            {
                                report.Data = await GetAssociationDashboardAsync(request.AssociationId.Value);
                            }
                        }
                        break;
                }

                // Generate download URL if format is not JSON
                if (request.Format?.ToLower() != "json")
                {
                    report.DownloadUrl = $"/api/reports/download/{Guid.NewGuid()}";
                }

                return report;
            }
            catch (Exception ex)
            {
                return new ReportResponseDto();
            }
        }

        public async Task<List<AssociationSummaryDto>> GetAssociationSummariesAsync()
        {
            try
            {
                var summaries = new List<AssociationSummaryDto>();

                var associations = await _dbContext.Associations.ToListAsync();

                foreach (var association in associations)
                {
                    var summary = new AssociationSummaryDto
                    {
                        AssociationId = association.Id,
                        AssociationName = association.Name
                    };

                    // Get metrics for this association
                    var members = await _dbContext.Members
                        .Where(m => m.RegionId == association.Id)
                        .ToListAsync();

                    summary.TotalMembers = members.Count;
                    summary.PendingMembers = await _dbContext.MemberPayments
                        .Where(mp => mp.Member.RegionId == association.Id && mp.PaymentStatus == PaymentStatus.PENDING)
                        .GroupBy(mp => mp.MemberId)
                        .CountAsync();

                    summary.Revenue = await _dbContext.MemberPayments
                        .Where(mp => mp.Member.RegionId == association.Id && mp.IsPaid)
                        .SumAsync(mp => mp.Amount);

                    summary.Receivable = await _dbContext.MemberPayments
                        .Where(mp => mp.Member.RegionId == association.Id && mp.PaymentStatus == PaymentStatus.PENDING)
                        .SumAsync(mp => mp.Amount);

                    // Get last activity (most recent member creation or payment)
                    var lastMemberActivity = await _dbContext.Members
                        .Where(m => m.RegionId == association.Id)
                        .OrderByDescending(m => m.CreatedDate)
                        .Select(m => m.CreatedDate)
                        .FirstOrDefaultAsync();

                    var lastPaymentActivity = await _dbContext.MemberPayments
                        .Where(mp => mp.Member.RegionId == association.Id)
                        .OrderByDescending(mp => mp.CreatedDate)
                        .Select(mp => mp.CreatedDate)
                        .FirstOrDefaultAsync();

                    summary.LastActivity = lastMemberActivity > lastPaymentActivity ? lastMemberActivity : lastPaymentActivity;

                    summaries.Add(summary);
                }

                return summaries;
            }
            catch (Exception ex)
            {
                return new List<AssociationSummaryDto>();
            }
        }

        public async Task<bool> ValidateAssociationAccessAsync(Guid associationId, string userId)
        {
            try
            {
                // This is a simplified validation - in a real implementation,
                // you would check user roles and permissions
                var user = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null) return false;

                // Super admin can access all associations
                if (user.Role == UserRole.Coalition) return true;

                // Association admin can only access their own association
                if (user.Role == UserRole.Association)
                {
                    return user.AssociationId == associationId;
                }

                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<List<MonthlyTrendDto>> GetMonthlyTrendsAsync(Guid? associationId)
        {
            try
            {
                var trends = new List<MonthlyTrendDto>();
                var currentYear = DateTime.Now.Year;

                for (int month = 1; month <= 12; month++)
                {
                    var startDate = new DateTime(currentYear, month, 1);
                    var endDate = startDate.AddMonths(1).AddDays(-1);

                    var memberQuery = _dbContext.Members
                        .Include(m => m.MembershipType)
                        .Where(m => m.CreatedDate >= startDate && m.CreatedDate <= endDate);

                    var paymentQuery = _dbContext.MemberPayments
                        .Include(mp => mp.Member.MembershipType)
                        .Where(mp => mp.CreatedDate >= startDate && mp.CreatedDate <= endDate);

                    if (associationId.HasValue)
                    {
                        memberQuery = memberQuery.Where(m => m.MembershipType.AssociationId == associationId.Value);
                        paymentQuery = paymentQuery.Where(mp => mp.Member.MembershipType.AssociationId == associationId.Value);
                    }

                    var newMembers = await memberQuery.CountAsync();
                    var revenue = await paymentQuery
                        .Where(mp => mp.IsPaid)
                        .SumAsync(mp => mp.Amount);

                    trends.Add(new MonthlyTrendDto
                    {
                        Month = startDate.ToString("MMM"),
                        NewMembers = newMembers,
                        Revenue = revenue,
                        Year = currentYear
                    });
                }

                return trends;
            }
            catch (Exception ex)
            {
                return new List<MonthlyTrendDto>();
            }
        }

        private async Task<List<GenderDistributionDto>> GetGenderDistributionAsync(Guid? associationId)
        {
            try
            {
                var memberQuery = _dbContext.Members.Include(m => m.MembershipType).AsQueryable();

                if (associationId.HasValue)
                {
                    memberQuery = memberQuery.Where(m => m.MembershipType.AssociationId == associationId.Value);
                }

                var totalMembers = await memberQuery.CountAsync();

                var distribution = await memberQuery
                    .GroupBy(m => m.Gender)
                    .Select(g => new GenderDistributionDto
                    {
                        Gender = g.Key.ToString(),
                        Count = g.Count(),
                        Percentage = totalMembers > 0 ? (double)g.Count() / totalMembers * 100 : 0
                    })
                    .ToListAsync();

                return distribution;
            }
            catch (Exception ex)
            {
                return new List<GenderDistributionDto>();
            }
        }

        private async Task<List<PaymentStatusDistributionDto>> GetPaymentStatusDistributionAsync(Guid? associationId)
        {
            try
            {
                var paymentQuery = _dbContext.MemberPayments.Include(mp => mp.Member.MembershipType).AsQueryable();

                if (associationId.HasValue)
                {
                    paymentQuery = paymentQuery.Where(mp => mp.Member.MembershipType.AssociationId == associationId.Value);
                }

                var totalPayments = await paymentQuery.CountAsync();

                var distribution = await paymentQuery
                    .GroupBy(mp => mp.PaymentStatus)
                    .Select(g => new PaymentStatusDistributionDto
                    {
                        PaymentStatus = g.Key.ToString(),
                        Count = g.Count(),
                        Percentage = totalPayments > 0 ? (double)g.Count() / totalPayments * 100 : 0
                    })
                    .ToListAsync();

                return distribution;
            }
            catch (Exception ex)
            {
                return new List<PaymentStatusDistributionDto>();
            }
        }

        private async Task<List<MembershipTypeDistributionDto>> GetMembershipTypeDistributionAsync(Guid? associationId)
        {
            try
            {
                var memberQuery = _dbContext.Members.Include(m => m.MembershipType).AsQueryable();

                if (associationId.HasValue)
                {
                    memberQuery = memberQuery.Where(m => m.MembershipType.AssociationId == associationId.Value);
                }

                var totalMembers = await memberQuery.CountAsync();

                var distribution = await memberQuery
                    .GroupBy(m => m.MembershipType)
                    .Select(g => new MembershipTypeDistributionDto
                    {
                        MembershipType = g.Key.ToString(),
                        Count = g.Count(),
                        Percentage = totalMembers > 0 ? (double)g.Count() / totalMembers * 100 : 0
                    })
                    .ToListAsync();

                return distribution;
            }
            catch (Exception ex)
            {
                return new List<MembershipTypeDistributionDto>();
            }
        }

        private async Task<List<RecentActivityDto>> GetRecentActivitiesAsync(Guid associationId)
        {
            try
            {
                var activities = new List<RecentActivityDto>();

                // Get recent member registrations
                var recentMembers = await _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Where(m => m.MembershipType.AssociationId == associationId)
                    .OrderByDescending(m => m.CreatedDate)
                    .Take(5)
                    .Select(m => new RecentActivityDto
                    {
                        ActivityType = "Member Registration",
                        Description = $"New member {m.FullName} registered",
                        Timestamp = m.CreatedDate,
                        MemberName = m.FullName
                    })
                    .ToListAsync();

                // Get recent payments
                var recentPayments = await _dbContext.MemberPayments
                    .Include(mp => mp.Member.MembershipType)
                    .Where(mp => mp.Member.MembershipType.AssociationId == associationId)
                    .OrderByDescending(mp => mp.CreatedDate)
                    .Take(5)
                    .Select(mp => new RecentActivityDto
                    {
                        ActivityType = "Payment",
                        Description = $"Payment of {mp.Amount:C} received from {mp.Member.FullName}",
                        Timestamp = mp.CreatedDate,
                        MemberName = mp.Member.FullName
                    })
                    .ToListAsync();

                activities.AddRange(recentMembers);
                activities.AddRange(recentPayments);

                return activities.OrderByDescending(a => a.Timestamp).Take(10).ToList();
            }
            catch (Exception ex)
            {
                return new List<RecentActivityDto>();
            }
        }
    }
}
