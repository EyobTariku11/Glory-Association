using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.DTOS.Users;
using MembershipInfrustructure.Model.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.Interfaces.Users
{
    public interface IDashboardService
    {
        // Existing method
        Task<DashboardNumericalDTo> GetNumbericalData(FilterCriteriaDto filterCriteriaDto);

        // New methods for enhanced dashboard system
        Task<CoalitionOverviewDto> GetCoalitionOverviewAsync();
        Task<AssociationDashboardDto> GetAssociationDashboardAsync(Guid associationId);
        Task<ReportResponseDto> GenerateReportAsync(ReportRequestDto request);
        Task<List<AssociationSummaryDto>> GetAssociationSummariesAsync();
        Task<bool> ValidateAssociationAccessAsync(Guid associationId, string userId);
    }
}
