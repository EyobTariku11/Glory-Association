using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Services.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipDigitalAPI.Controllers.Configuration
{
    [Route("api/[controller]")]
    [ApiController]
    public class EducationalLevelController : ControllerBase
    {

        IEducationalLevelService _EducationalLevelService;

        public EducationalLevelController(IEducationalLevelService EducationalLevelService)
        {
            _EducationalLevelService = EducationalLevelService;
        }


        [HttpGet]
        [ProducesResponseType(typeof(EducationalLevelGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetEducationalLevelList()
        {
            return Ok(await _EducationalLevelService.GetEducationalLevelList());
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddEducationalLevel([FromBody] EducationalLevelPostDto EducationalLevelDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _EducationalLevelService.AddEducationalLevel(EducationalLevelDto));
            }
            else
            {
                return BadRequest();
            }
        }


        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateEducationalLevel(EducationalLevelGetDto EducationalLevelDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _EducationalLevelService.UpdateEducationalLevel(EducationalLevelDto));
            }
            else
            {
                return BadRequest();
            }
        }
        [HttpDelete]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeleteEducationalLevel(Guid educationalLevelId)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _EducationalLevelService.DeleteEducationalLevel(educationalLevelId));
            }
            else
            {
                return BadRequest();
            }
        }

    }
}
