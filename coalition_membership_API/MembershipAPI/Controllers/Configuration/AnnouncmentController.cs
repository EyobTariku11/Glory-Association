using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipAPI.Controllers.Configuration
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AnnouncmentController : ControllerBase
    {

        IAnnouncmentService _AnnouncmentService;

        public AnnouncmentController(IAnnouncmentService AnnouncmentService)
        {
            _AnnouncmentService = AnnouncmentService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(AnnouncmentGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAnnouncmentList()
        {
            return Ok(await _AnnouncmentService.GetAnnouncmentList());
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddAnnouncment([FromForm] AnnouncmentPostDto AnnouncmentDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _AnnouncmentService.AddAnnouncment(AnnouncmentDto));
            }
            else
            {
                return BadRequest();
            }
        }


        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateAnnouncment([FromForm]AnnouncmentGetDto AnnouncmentDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _AnnouncmentService.UpdateAnnouncment(AnnouncmentDto));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpDelete]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeleteAnnouncment(Guid AnnouncmentId)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _AnnouncmentService.DeleteAnnouncment(AnnouncmentId));
            }
            else
            {
                return BadRequest();
            }
        }
    }
}
