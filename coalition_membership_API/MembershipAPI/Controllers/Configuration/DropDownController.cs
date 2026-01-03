using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Services.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using MembershipInfrustructure.Model.Configuration;

namespace MembershipDigitalAPI.Controllers.Configuration
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DropDownController : ControllerBase
    {
        IDropDownService _DropDownService;

        public DropDownController(IDropDownService DropDownService)
        {
            _DropDownService = DropDownService;
        }

        

        [HttpGet]
        [ProducesResponseType(typeof(SelectListDto), (int)HttpStatusCode.OK)]

        public async Task<IActionResult> GetRegionDropdownList(string type)
        {
            return Ok(await _DropDownService.GetRegionDropdownList(type));
        }

        [HttpGet]
        [ProducesResponseType(typeof(SelectListDto), (int)HttpStatusCode.OK)]

        public async Task<IActionResult> GetZoneDropdownList(Guid RegionId)
        {
            return Ok(await _DropDownService.GetZoneDropdownList(RegionId));
        }

        

        [HttpGet]
        [ProducesResponseType(typeof(SelectListDto), (int)HttpStatusCode.OK)]

        public async Task<IActionResult> GetMembershipDropDown(Guid associationId)
        {
            return Ok(await _DropDownService.GetMembershipTypesDropDown(associationId));
        }


    }
}
