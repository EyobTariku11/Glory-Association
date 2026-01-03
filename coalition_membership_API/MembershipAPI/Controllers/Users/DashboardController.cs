
using MembershipImplementation.DTOS.Users;
using MembershipImplementation.Interfaces.Users;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipAPI.Controllers.Users
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {

        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {

            _dashboardService = dashboardService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(DashboardNumericalDTo), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetNumbericalData([FromQuery] FilterCriteriaDto filterCriteriaDto)
        {
            return Ok(await _dashboardService.GetNumbericalData( filterCriteriaDto));
        }
    }
}
