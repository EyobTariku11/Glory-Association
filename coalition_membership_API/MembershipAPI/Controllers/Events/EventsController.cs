using System.Net;
using System.Security.Claims;
using Implementation.Helper;
using MembershipImplementation.DTOS.Events;
using MembershipImplementation.Interfaces.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Implementation.DTOS.Authentication;

namespace MembershipAPI.Controllers.Events;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    // Public endpoints (no authentication required)
    [HttpGet]
    [ProducesResponseType(typeof(List<EventGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAllEvents()
    {
        var events = await _eventService.GetAllEvents();
        return Ok(new ResponseMessage<List<EventGetDto>>
        {
            Success = true,
            Message = "Events retrieved successfully",
            Data = events
        });
    }

    [HttpGet("approved")]
    [ProducesResponseType(typeof(List<EventGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetApprovedEvents()
    {
        var events = await _eventService.GetApprovedEvents();
        return Ok(new ResponseMessage<List<EventGetDto>>
        {
            Success = true,
            Message = "Approved events retrieved successfully",
            Data = events
        });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EventGetDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetEventById(Guid id)
    {
        var eventItem = await _eventService.GetEventById(id);
        if (eventItem == null)
            return NotFound();
        
        return Ok(new ResponseMessage<EventGetDto>
        {
            Success = true,
            Message = "Event retrieved successfully",
            Data = eventItem
        });
    }

    [HttpGet("upcoming")]
    [ProducesResponseType(typeof(List<EventGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetUpcomingEvents([FromQuery] int days = 30)
    {
        var events = await _eventService.GetUpcomingEvents(days);
        return Ok(new ResponseMessage<List<EventGetDto>>
        {
            Success = true,
            Message = "Upcoming events retrieved successfully",
            Data = events
        });
    }

    // Association endpoints (requires Association role)
    [Authorize(Roles = "Association")]
    [HttpGet("my-events")]
    [ProducesResponseType(typeof(List<EventGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetMyEvents()
    {
        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        var events = await _eventService.GetEventsByAssociation(assocId);
        return Ok(new ResponseMessage<List<EventGetDto>>
        {
            Success = true,
            Message = "My events retrieved successfully",
            Data = events
        });
    }

    [Authorize(Roles = "Association")]
    [HttpPost]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.Created)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateEvent([FromForm] EventPostDto eventDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var createdById = User.FindFirstValue("userId") ?? "system";
        var associationId = User.FindFirstValue("loginId");
        
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        eventDto.AssociationId = assocId;
        var result = await _eventService.CreateEvent(eventDto, createdById);
        
        if (result.Success)
            return CreatedAtAction(nameof(GetEventById), new { id = result.Data }, result);
        
        return BadRequest(result);
    }

    [Authorize(Roles = "Association")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> UpdateEvent(Guid id, [FromForm] EventPostDto eventDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        eventDto.AssociationId = assocId;
        var result = await _eventService.UpdateEvent(id, eventDto);
        
        if (result.Success)
            return Ok(result);
        
        return BadRequest(result);
    }

    [Authorize(Roles = "Association")]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var result = await _eventService.DeleteEvent(id);
        return Ok(result);
    }

    // Coalition endpoints (requires Coalition role)
    [Authorize(Roles = "Coalition")]
    [HttpGet("pending-approval")]
    [ProducesResponseType(typeof(List<EventGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetPendingApprovalEvents()
    {
        var events = await _eventService.GetPendingApprovalEvents();
        return Ok(new ResponseMessage<List<EventGetDto>>
        {
            Success = true,
            Message = "Pending approval events retrieved successfully",
            Data = events
        });
    }

    [Authorize(Roles = "Coalition")]
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> ApproveEvent(Guid id)
    {
        var approvedById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var result = await _eventService.ApproveEvent(id, approvedById);
        return Ok(result);
    }

    [Authorize(Roles = "Coalition")]
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> RejectEvent(Guid id, [FromBody] string? reason = null)
    {
        var rejectedById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var result = await _eventService.RejectEvent(id, rejectedById, reason);
        return Ok(result);
    }

    // Donation endpoints
    [HttpPost("donations")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.Created)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateDonation([FromBody] EventDonationPostDto donationDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // If user is logged in, set member ID
        var memberId = User.FindFirstValue("loginId");
        if (!string.IsNullOrEmpty(memberId) && Guid.TryParse(memberId, out var memberGuid))
        {
            donationDto.MemberId = memberGuid;
        }

        var result = await _eventService.CreateEventDonation(donationDto);
        
        if (result.Success)
        {
            // Generate unique reference for this donation
            var donationReference = $"DON_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}".Substring(0, 20);
            
            // Return success with donation reference for ArifPay payment
            var response = new
            {
                Success = true,
                Message = "Donation created successfully. Proceed to payment.",
                DonationReference = donationReference,
                PaymentData = new
                {
                    amount = donationDto.Amount,
                    email = donationDto.Email ?? "anonymous@donor.com",
                    phone = donationDto.PhoneNumber ?? "",
                    return_url = $"{Request.Scheme}://{Request.Host}/donation/status",
                    currency = "ETB",
                    donorName = donationDto.DonorName ?? "Anonymous Donor",
                    message = "",
                    donationReference = donationReference,
                    eventId = donationDto.EventId
                },
                ArifPayUrl = $"{Request.Scheme}://{Request.Host}/payment/arifpay/donation"
            };
            
            return CreatedAtAction(nameof(GetEventDonations), new { eventId = donationDto.EventId }, 
                new ResponseMessage<object>
                {
                    Success = true,
                    Message = "Donation created successfully",
                    Data = response
                });
        }
        
        return BadRequest(result);
    }

    [HttpGet("{eventId}/donations")]
    [ProducesResponseType(typeof(List<EventDonationGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetEventDonations(Guid eventId)
    {
        var donations = await _eventService.GetEventDonations(eventId);
        return Ok(new ResponseMessage<List<EventDonationGetDto>>
        {
            Success = true,
            Message = "Event donations retrieved successfully",
            Data = donations
        });
    }

    [Authorize(Roles = "Association,Coalition")]
    [HttpPut("donations/{donationId}/payment-status")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> UpdateDonationPaymentStatus(Guid donationId, [FromBody] UpdatePaymentStatusDto paymentStatus)
    {
        var result = await _eventService.UpdateDonationPaymentStatus(
            donationId, 
            paymentStatus.IsPaid, 
            paymentStatus.TransactionReference);
        
        return Ok(result);
    }

    // Statistics endpoint
    [Authorize(Roles = "Association")]
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetEventStatistics()
    {
        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        var statistics = await _eventService.GetEventStatistics(assocId);
        return Ok(statistics);
    }
}

public record UpdatePaymentStatusDto
{
    public bool IsPaid { get; set; }
    public string TransactionReference { get; set; } = null!;
} 