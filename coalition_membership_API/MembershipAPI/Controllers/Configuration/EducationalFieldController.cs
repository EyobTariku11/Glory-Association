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
    public class EducationalFieldController : ControllerBase
    {


        IEducationalFieldService _educationalFieldService;

        public EducationalFieldController(IEducationalFieldService educationalFieldService)
        {
            _educationalFieldService = educationalFieldService;
        }


        [HttpGet]
        [ProducesResponseType(typeof(EducationalFieldGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetEducationalFieldList()
        {
            return Ok(await _educationalFieldService.GetEducationalFieldList());
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddEducationalField([FromBody] EducationalFieldPostDto EducationalFieldDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _educationalFieldService.AddEducationalField(EducationalFieldDto));
            }
            else
            {
                return BadRequest();
            }
        }


        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateEducationalField(EducationalFieldGetDto EducationalFieldDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _educationalFieldService.UpdateEducationalField(EducationalFieldDto));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpDelete]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeleteEducationalField(Guid educationalFieldId)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _educationalFieldService.DeleteEducationalField(educationalFieldId));
            }
            else
            {
                return BadRequest();
            }
        }

    }
}
