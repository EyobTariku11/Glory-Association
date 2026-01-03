using MembershipImplementation.DTOS.Users;
using MembershipImplementation.Interfaces.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace MembershipAPI.Controllers.Users
{
    [Route("api/association")]
    [ApiController]
    [Authorize(Roles = "Association,Coalition")]
    public class AssociationController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public AssociationController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Get dashboard for the logged-in association
        /// </summary>
        /// <returns>Association dashboard with detailed metrics and reports</returns>
        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(AssociationDashboardDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.Forbidden)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                // Get the current user's association ID from claims
                var userId = User.FindFirst("userId")?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userAssociationId = User.FindFirst("loginId")?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                Guid associationId;

                // Coalition admin can access any association, but for association admin, use their assigned association
                if (userRole == "Coalition")
                {
                    // For coalition admin, we need to get the association ID from query parameters or use a default
                    // This could be enhanced based on your requirements
                    return BadRequest(new { message = "Coalition admin must specify association ID" });
                }
                else if (userRole == "Association")
                {
                    if (string.IsNullOrEmpty(userAssociationId) || !Guid.TryParse(userAssociationId, out associationId))
                    {
                        return Forbid();
                    }
                }
                else
                {
                    return Forbid();
                }

                // Validate access
                var hasAccess = await _dashboardService.ValidateAssociationAccessAsync(associationId, userId);
                if (!hasAccess)
                {
                    return Forbid();
                }

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

        /// <summary>
        /// Get dashboard for a specific association (with access control)
        /// </summary>
        /// <param name="associationId">The ID of the association</param>
        /// <returns>Association dashboard with detailed metrics and reports</returns>
        [HttpGet("{associationId}/dashboard")]
        [ProducesResponseType(typeof(AssociationDashboardDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.Forbidden)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetDashboardById(Guid associationId)
        {
            try
            {
                // Get the current user's information
                var userId = User.FindFirst("userId")?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Validate access
                var hasAccess = await _dashboardService.ValidateAssociationAccessAsync(associationId, userId);
                if (!hasAccess)
                {
                    return Forbid();
                }

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