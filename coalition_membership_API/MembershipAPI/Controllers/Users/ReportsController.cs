using MembershipImplementation.DTOS.Users;
using MembershipImplementation.Interfaces.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace MembershipAPI.Controllers.Users
{
    [Route("api/reports")]
    [ApiController]
    [Authorize(Roles = "Coalition,Association")]
    public class ReportsController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public ReportsController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Generate reports based on scope and parameters
        /// </summary>
        /// <param name="scope">Scope of the report: "coalition" or "association"</param>
        /// <param name="associationId">Association ID (required for association scope)</param>
        /// <param name="reportType">Type of report: "overview", "detailed", "financial", etc.</param>
        /// <param name="startDate">Start date for the report period</param>
        /// <param name="endDate">End date for the report period</param>
        /// <param name="format">Output format: "json", "pdf", "excel"</param>
        /// <returns>Generated report</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ReportResponseDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.Forbidden)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> GenerateReport(
            [FromQuery] string scope,
            [FromQuery] Guid? associationId,
            [FromQuery] string reportType = "overview",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string format = "json")
        {
            try
            {
                // Get current user information
                var userId = User.FindFirst("userId")?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Validate scope and access permissions
                if (string.IsNullOrEmpty(scope))
                {
                    return BadRequest(new { message = "Scope is required" });
                }

                // Coalition admin can access coalition reports
                if (scope.ToLower() == "coalition" && userRole != "Coalition")
                {
                    return Forbid();
                }

                // Association scope requires association ID
                if (scope.ToLower() == "association")
                {
                    if (!associationId.HasValue)
                    {
                        return BadRequest(new { message = "Association ID is required for association scope" });
                    }

                    // Validate access to the specific association
                    var hasAccess = await _dashboardService.ValidateAssociationAccessAsync(associationId.Value, userId);
                    if (!hasAccess)
                    {
                        return Forbid();
                    }
                }

                // Create report request
                var request = new ReportRequestDto
                {
                    Scope = scope,
                    AssociationId = associationId,
                    ReportType = reportType,
                    StartDate = startDate,
                    EndDate = endDate,
                    Format = format
                };

                // Generate the report
                var report = await _dashboardService.GenerateReportAsync(request);

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, 
                    new { message = "An error occurred while generating the report", error = ex.Message });
            }
        }

        /// <summary>
        /// Download a generated report file
        /// </summary>
        /// <param name="reportId">The ID of the report to download</param>
        /// <returns>Report file</returns>
        [HttpGet("download/{reportId}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.Forbidden)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DownloadReport(Guid reportId)
        {
            try
            {
                // Get current user information
                var userId = User.FindFirst("userId")?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // This is a placeholder implementation
                // In a real application, you would:
                // 1. Retrieve the report from storage using reportId
                // 2. Validate user access to the report
                // 3. Return the actual file

                return NotFound(new { message = "Report not found or download not implemented" });
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, 
                    new { message = "An error occurred while downloading the report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get available report types for the current user
        /// </summary>
        /// <returns>List of available report types</returns>
        [HttpGet("types")]
        [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        public async Task<IActionResult> GetAvailableReportTypes()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(userRole))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var reportTypes = new List<object>();

                if (userRole == "Coalition")
                {
                    reportTypes.AddRange(new[]
                    {
                        new { scope = "coalition", type = "overview", description = "Coalition overview with all associations" },
                        new { scope = "coalition", type = "financial", description = "Financial summary across all associations" },
                        new { scope = "coalition", type = "membership", description = "Membership statistics across all associations" },
                        new { scope = "association", type = "overview", description = "Individual association overview" },
                        new { scope = "association", type = "detailed", description = "Detailed association report" }
                    });
                }
                else if (userRole == "Association")
                {
                    reportTypes.AddRange(new[]
                    {
                        new { scope = "association", type = "overview", description = "Association overview" },
                        new { scope = "association", type = "detailed", description = "Detailed association report" },
                        new { scope = "association", type = "financial", description = "Financial report for the association" },
                        new { scope = "association", type = "membership", description = "Membership report for the association" }
                    });
                }

                return Ok(reportTypes);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, 
                    new { message = "An error occurred while retrieving report types", error = ex.Message });
            }
        }
    }
} 