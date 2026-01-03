using FluentEmail.Core;
using Implementation.Helper;
using MembershipImplementation.Helper;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Services.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipImplementation.Controllers.Configuration
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {

        private readonly IEmailService _emailService;
        public EmailController(IEmailService emailService)
        {
            _emailService=emailService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> SendEmail(EmailMetadata emailMetadata)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _emailService.Send(emailMetadata));
            }
            else
            {
                return BadRequest();
            }
        }
    }
}
