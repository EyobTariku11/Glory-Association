using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.DTOS.Payment;
using MembershipImplementation.Interfaces.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipAPI.Controllers.Configuration
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MembershipTypeController : ControllerBase
    {
        IMembershipTypeService _MembershipTypeService;

        public MembershipTypeController(IMembershipTypeService MembershipTypeService)
        {
            _MembershipTypeService = MembershipTypeService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(MembershipTypeGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetMembershipTypeList(Guid associationId)
        {
            return Ok(await _MembershipTypeService.GetMembershipTypeList(associationId));
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage<Guid>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddMembershipType(MembershipTypePostDto MembershipTypeDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _MembershipTypeService.AddMembershipType(MembershipTypeDto));
            }
            else
            {
                return BadRequest();
            }
        }


        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateMembershipType(MembershipTypeGetDto MembershipTypeDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _MembershipTypeService.UpdateMembershipType(MembershipTypeDto));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpDelete]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeleteMembershipType(Guid MembershipTypeId)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _MembershipTypeService.DeleteMembershipType(MembershipTypeId));
            }
            else
            {
                return BadRequest();
            }
        }

    


        
    }
}
