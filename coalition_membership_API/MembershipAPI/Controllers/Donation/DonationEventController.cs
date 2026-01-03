using System.Net;
using Implementation.Helper;
using MembershipImplementation.DTOS.Donation;
using MembershipImplementation.DTOS.Payment;
using MembershipImplementation.Interfaces.Donation;
using Microsoft.AspNetCore.Mvc;

namespace MembershipAPI.Controllers.Donation;

[ApiController]
[Route("api/[controller]/[action]")]
public class DonationEventsController : ControllerBase
{
    private readonly IDonationEventService _donationEventService;

    public DonationEventsController(IDonationEventService donationEventService)
    {
        _donationEventService = donationEventService;
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromForm] DonationEventPostDto donationEventPostDto)
    {
        var result = await _donationEventService.AddDonationEvent(donationEventPostDto);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update(Guid id, [FromForm] DonationEventPostDto donationEventPostDto)
    {
        var result = await _donationEventService.UpdateDonationEvent(id, donationEventPostDto);
        return Ok(result);
    }

    [HttpDelete]
    public async Task<IActionResult> Remove(Guid id)
    {
        var success = await _donationEventService.RemoveDonationEvent(id);
        return Ok(success);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _donationEventService.GetAllDonationEvents();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _donationEventService.GetByIdDonation(id);
        return Ok(result);
    }
    
    [HttpPost]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> MakePayment(DonationPaymentDto donationEventGetDto)
    {
        if (ModelState.IsValid)
        {
            return Ok(await _donationEventService.MakePayment(donationEventGetDto));
        }
        else
        {
            return BadRequest();
        }
    }
    
    [HttpPost]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> MakePaymentConfirmation(string textRn,string phoneNumber)
    {
        if (ModelState.IsValid)
        {
            return Ok(await _donationEventService.MakePaymentConfirmation(textRn,phoneNumber));
        }
        else
        {
            return BadRequest();
        }
    }
}
