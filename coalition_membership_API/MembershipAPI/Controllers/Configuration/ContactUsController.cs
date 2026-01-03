using System.Net;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using Microsoft.AspNetCore.Mvc;

namespace MembershipAPI.Controllers.Configuration;



[Route("api/[controller]/[action]")]
[ApiController]
public class ContactUsController :ControllerBase
{
    IContactService _contactService;

    public ContactUsController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<ContactUsDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetContactUsMessages()
    {
        return Ok(await _contactService.GetContactMessages());
    }
        
        
    [HttpPost]
    [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> AddContactUs(ContactUsDto contactUsDto)
    {
        return Ok(await _contactService.AddContactUs(contactUsDto));
    }

}