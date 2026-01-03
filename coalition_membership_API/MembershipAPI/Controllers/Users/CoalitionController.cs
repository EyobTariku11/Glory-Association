using MembershipImplementation.DTOS.Users;
using MembershipImplementation.Interfaces.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipAPI.Controllers.Users
{
    [Route("api/coalition")]
    [ApiController]
    [Authorize(Roles = "Coalition")]
    public class CoalitionController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public CoalitionController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Get coalition overview with aggregated data from all associations
        /// </summary>
        /// <returns>Coalition overview with metrics and association summaries</returns>
        [HttpGet("overview")]
        [ProducesResponseType(typeof(CoalitionOverviewDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.Forbidden)]
        public async Task<IActionResult> GetOverview()
        {
            try
            {
                var overview = await _dashboardService.GetCoalitionOverviewAsync();
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, 
                    new { message = "An error occurred while retrieving coalition overview", error = ex.Message });
            }
        }

        /// <summary>
        /// Get summaries of all associations for coalition view
        /// </summary>
        /// <returns>List of association summaries</returns>
        [HttpGet("associations")]
        [ProducesResponseType(typeof(List<AssociationSummaryDto>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.Forbidden)]
        public async Task<IActionResult> GetAssociationSummaries()
        {
            try
            {
                var summaries = await _dashboardService.GetAssociationSummariesAsync();
                return Ok(summaries);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, 
                    new { message = "An error occurred while retrieving association summaries", error = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed dashboard for a specific association (coalition admin access)
        /// </summary>
        /// <param name="associationId">The ID of the association</param>
        /// <returns>Detailed association dashboard</returns>
        [HttpGet("associations/{associationId}/dashboard")]
        [ProducesResponseType(typeof(AssociationDashboardDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.Forbidden)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetAssociationDashboard(Guid associationId)
        {
            try
            {
                var dashboard = await _dashboardService.GetAssociationDashboardAsync(associationId);
                
                if (dashboard.AssociationId == Guid.Empty)
                {
                    return NotFound(new { message = "Association not found" });
                }

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, 
                    new { message = "An error occurred while retrieving association dashboard", error = ex.Message });
            }
        }
    }
} 