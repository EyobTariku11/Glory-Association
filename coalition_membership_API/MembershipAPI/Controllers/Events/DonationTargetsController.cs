using System.Net;
using System.Security.Claims;
using Implementation.Helper;
using MembershipImplementation.DTOS.Events;
using MembershipImplementation.Interfaces.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Implementation.DTOS.Authentication;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace MembershipAPI.Controllers.Events;

[ApiController]
[Route("api/[controller]")]
public class DonationTargetsController : ControllerBase
{
    private readonly IDonationTargetService _donationTargetService;
    private readonly ILogger<DonationTargetsController> _logger;

    public DonationTargetsController(
        IDonationTargetService donationTargetService,
        ILogger<DonationTargetsController> logger)
    {
        _donationTargetService = donationTargetService;
        _logger = logger;
    }

    // Public endpoints (no authentication required)
    [HttpGet]
    [ProducesResponseType(typeof(List<DonationTargetGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAllDonationTargets()
    {
        var targets = await _donationTargetService.GetAllDonationTargets();
        return Ok(new ResponseMessage<List<DonationTargetGetDto>>
        {
            Success = true,
            Message = "Donation targets retrieved successfully",
            Data = targets
        });
    }

    [HttpGet("approved")]
    [ProducesResponseType(typeof(List<DonationTargetGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetApprovedDonationTargets()
    {
        var targets = await _donationTargetService.GetApprovedDonationTargets();
        return Ok(new ResponseMessage<List<DonationTargetGetDto>>
        {
            Success = true,
            Message = "Approved donation targets retrieved successfully",
            Data = targets
        });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DonationTargetGetDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetDonationTargetById(Guid id)
    {
        var target = await _donationTargetService.GetDonationTargetById(id);
        if (target == null)
            return NotFound();
        
        return Ok(new ResponseMessage<DonationTargetGetDto>
        {
            Success = true,
            Message = "Donation target retrieved successfully",
            Data = target
        });
    }

    // Association endpoints (requires Association role)
    [Authorize(Roles = "Association")]
    [HttpGet("my-targets")]
    [ProducesResponseType(typeof(List<DonationTargetGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetMyDonationTargets()
    {
        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        var targets = await _donationTargetService.GetDonationTargetsByAssociation(assocId);
        return Ok(new ResponseMessage<List<DonationTargetGetDto>>
        {
            Success = true,
            Message = "My donation targets retrieved successfully",
            Data = targets
        });
    }

    [Authorize(Roles = "Association")]
    [HttpPost]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.Created)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateDonationTarget([FromBody] DonationTargetPostDto donationTargetDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var createdById = User.FindFirstValue("userId") ?? "system";
        var associationId = User.FindFirstValue("loginId");
        
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        donationTargetDto.AssociationId = assocId;
        var result = await _donationTargetService.CreateDonationTarget(donationTargetDto, createdById);
        
        if (result.Success)
            return CreatedAtAction(nameof(GetDonationTargetById), new { id = result.Data }, result);
        
        return BadRequest(result);
    }

    [Authorize(Roles = "Association")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> UpdateDonationTarget(Guid id, [FromBody] DonationTargetPostDto donationTargetDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        donationTargetDto.AssociationId = assocId;
        var result = await _donationTargetService.UpdateDonationTarget(id, donationTargetDto);
        
        if (result.Success)
            return Ok(result);
        
        return BadRequest(result);
    }

    [Authorize(Roles = "Association")]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> DeleteDonationTarget(Guid id)
    {
        var result = await _donationTargetService.DeleteDonationTarget(id);
        return Ok(result);
    }

    // Coalition endpoints (requires Coalition role)
    [Authorize(Roles = "Coalition")]
    [HttpGet("pending-approval")]
    [ProducesResponseType(typeof(List<DonationTargetGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetPendingApprovalDonationTargets()
    {
        var targets = await _donationTargetService.GetPendingApprovalDonationTargets();
        return Ok(new ResponseMessage<List<DonationTargetGetDto>>
        {
            Success = true,
            Message = "Pending approval donation targets retrieved successfully",
            Data = targets
        });
    }

    [Authorize(Roles = "Coalition")]
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> ApproveDonationTarget(Guid id)
    {
        var approvedById = User.FindFirstValue("userId") ?? "system";
        var result = await _donationTargetService.ApproveDonationTarget(id, approvedById);
        return Ok(result);
    }

    [Authorize(Roles = "Coalition")]
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> RejectDonationTarget(Guid id, [FromBody] string? reason = null)
    {
        var rejectedById = User.FindFirstValue("userId") ?? "system";
        var result = await _donationTargetService.RejectDonationTarget(id, rejectedById, reason);
        return Ok(result);
    }

    // Donation endpoints for targets
    [HttpPost("{targetId}/donations")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.Created)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateDonationForTarget(Guid targetId, [FromBody] DonationTargetDonationPostDto donationDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // If user is logged in, set member ID
        var memberId = User.FindFirstValue("loginId");
        if (!string.IsNullOrEmpty(memberId) && Guid.TryParse(memberId, out var memberGuid))
        {
            donationDto.MemberId = memberGuid;
        }

        // Convert to EventDonationPostDto for the service
        var eventDonationDto = new EventDonationPostDto
        {
            EventId = null, // Not linked to a specific event (standalone donation)
            DonorName = donationDto.DonorName,
            PhoneNumber = donationDto.PhoneNumber,
            Email = donationDto.Email,
            Amount = donationDto.Amount,
            MemberId = donationDto.MemberId,
            ArifPaySessionId = donationDto.ArifPaySessionId,
            DonationReference = donationDto.DonationReference
        };

        var result = await _donationTargetService.CreateDonationForTarget(targetId, eventDonationDto);
        
        if (result.Success)
        {
            // Generate unique reference for this donation
            var donationReference = $"DON_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}".Substring(0, 20);
            
            // Return success with donation reference
            var response = new
            {
                Success = true,
                Message = "Donation created successfully with ArifPay session.",
                DonationReference = donationDto.DonationReference ?? donationReference,
                PaymentData = new
                {
                    amount = donationDto.Amount,
                    email = donationDto.Email ?? "anonymous@donor.com",
                    phone = donationDto.PhoneNumber ?? "",
                    return_url = $"{Request.Scheme}://{Request.Host}/donation/status",
                    currency = "ETB",
                    donorName = donationDto.DonorName,
                    message = donationDto.Message ?? "Supporting football development", // Default message if none provided
                    donationReference = donationDto.DonationReference ?? donationReference,
                    targetId = targetId
                }
            };
            
            return CreatedAtAction(nameof(GetDonationsForTarget), new { targetId }, 
                new ResponseMessage<object>
                {
                    Success = true,
                    Message = "Donation created successfully",
                    Data = response
                });
        }
        
        return BadRequest(result);
    }

    [HttpGet("{targetId}/donations")]
    [ProducesResponseType(typeof(List<EventDonationGetDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDonationsForTarget(Guid targetId)
    {
        var donations = await _donationTargetService.GetDonationsForTarget(targetId);
        return Ok(new ResponseMessage<List<EventDonationGetDto>>
        {
            Success = true,
            Message = "Donations for target retrieved successfully",
            Data = donations
        });
    }

    /// <summary>
    /// Updates donation payment status when payment returns from ArifPay
    /// </summary>
    [HttpPost("update-payment-status")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> UpdateDonationPaymentStatus([FromBody] UpdateDonationPaymentStatusDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            // Find the donation by reference using the DonationTargetService
            var donation = await _donationTargetService.GetDonationByReference(request.Reference);
            
            if (donation == null)
            {
                return BadRequest(new ResponseMessage
                {
                    Success = false,
                    Message = "Donation not found with the provided reference"
                });
            }

            // Update donation status using the service
            var updateResult = await _donationTargetService.UpdateDonationPaymentStatus(
                request.Reference, 
                request.Status, 
                request.SessionId
            );

            if (!updateResult.Success)
            {
                return BadRequest(updateResult);
            }

            _logger.LogInformation("Donation payment status updated successfully: Reference={Reference}, Status={Status}, SessionId={SessionId}",
                request.Reference, request.Status, request.SessionId);

            return Ok(new ResponseMessage
            {
                Success = true,
                Message = $"Donation payment status updated to {request.Status}",
                Data = updateResult.Data
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating donation payment status: Reference={Reference}, Status={Status}",
                request.Reference, request.Status);

            return StatusCode(500, new ResponseMessage
            {
                Success = false,
                Message = "Error updating donation payment status"
            });
        }
    }

    /// <summary>
    /// Webhook endpoint for ArifPay payment confirmations
    /// </summary>
    [HttpPost("webhook/arifpay")]
    public async Task<IActionResult> ArifPayWebhook([FromBody] JsonElement webhookData)
    {
        try
        {
            _logger.LogInformation("ArifPay webhook received: {WebhookData}", webhookData.ToString());

            // Extract payment information from webhook
            var paymentStatus = webhookData.GetProperty("status").GetString();
            var transactionReference = webhookData.GetProperty("transactionId").GetString();
            var sessionId = webhookData.GetProperty("sessionId").GetString();
            var amount = webhookData.GetProperty("amount").GetDecimal();

            _logger.LogInformation("Processing ArifPay webhook: Status={Status}, TransactionId={TransactionId}, SessionId={SessionId}, Amount={Amount}",
                paymentStatus, transactionReference, sessionId, amount);

            // Update donation payment status using the service
            var updateResult = await _donationTargetService.UpdateDonationPaymentStatus(
                transactionReference, 
                paymentStatus, 
                sessionId
            );

            if (!updateResult.Success)
            {
                _logger.LogError("Failed to update donation payment status: {Error}", updateResult.Message);
                return BadRequest(updateResult);
            }

            _logger.LogInformation("Donation payment status updated successfully via webhook: Reference={Reference}, Status={Status}",
                transactionReference, paymentStatus);

            return Ok(new { 
                message = "Webhook processed successfully",
                status = paymentStatus,
                transactionId = transactionReference
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing ArifPay webhook");
            return StatusCode(500, new { message = "Error processing webhook" });
        }
    }

    // Statistics endpoint
    [Authorize(Roles = "Association")]
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDonationTargetStatistics()
    {
        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        var statistics = await _donationTargetService.GetDonationTargetStatistics(assocId);
        return Ok(statistics);
    }
}

// DTO for updating donation payment status
public class UpdateDonationPaymentStatusDto
{
    public string Reference { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // success, cancelled, error
    public string? SessionId { get; set; }
} 