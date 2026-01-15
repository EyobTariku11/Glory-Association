using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net;
using System.Security.Claims;
using MembershipImplementation.DTOS.EventMessage;
using MembershipImplementation.Interfaces.Message;
using MembershipInfrustructure.Model.Message;
using Implementation.Helper;

namespace MembershipAPI.Controllers.Message
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class EventMessagesController : ControllerBase
    {
        private readonly IEventMessageService _eventMessageService;

        public EventMessagesController(IEventMessageService eventMessageService)
        {
            _eventMessageService = eventMessageService;
        }

        [HttpPost]
        public async Task<IActionResult> AddEventMessage([FromBody] EventMessagePostDto eventMessagePost)
        {
            var associationId = User.FindFirstValue("loginId");
            
            if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
                return BadRequest("Invalid association ID");

            var result = await _eventMessageService.AddEventMessage(eventMessagePost, assocId);
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateEventMessage([FromBody] EventMessageGetDto eventMessageGet)
        {
            // Get association ID from user claims (for Association users)
            Guid? associationId = null;
            var associationIdClaim = User.FindFirstValue("loginId");
            if (!string.IsNullOrEmpty(associationIdClaim) && Guid.TryParse(associationIdClaim, out var assocId))
            {
                associationId = assocId;
            }

            var result = await _eventMessageService.UpdateEventMessage(eventMessageGet, associationId);
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetEventMessage([FromQuery] bool isApproved)
        {
            // Get association ID from user claims (for Association users)
            Guid? associationId = null;
            var associationIdClaim = User.FindFirstValue("loginId");
            if (!string.IsNullOrEmpty(associationIdClaim) && Guid.TryParse(associationIdClaim, out var assocId))
            {
                associationId = assocId;
            }

            var result = await _eventMessageService.GetEventMessage(isApproved, associationId);
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        [HttpPost]
        public async Task<IActionResult> AddEventMessageMember(EventMessageMemberPostDto eventMessageMember)
        {
            // Get association ID from user claims (for Association users)
            Guid? associationId = null;
            var associationIdClaim = User.FindFirstValue("loginId");
            if (!string.IsNullOrEmpty(associationIdClaim) && Guid.TryParse(associationIdClaim, out var assocId))
            {
                associationId = assocId;
            }

            var result = await _eventMessageService.AddEventMessageMember(eventMessageMember, associationId);
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetEventMessageMember([FromQuery] MessageStatus? messageStatus, [FromQuery] Guid? eventMessageId)
        {
            var result = await _eventMessageService.GetEventMessageMember(messageStatus, eventMessageId);
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        [HttpPut]
        public async Task<IActionResult> ChangeMessageStatus([FromBody] List<Guid> memberMessageIds)
        {
            var result = await _eventMessageService.ChangeMessageStatus(memberMessageIds);
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }
        
        
        [HttpGet]
        public async Task<IActionResult> GetUnsentMessages(bool isSent)
        {
            // Get association ID from user claims (for Association users)
            Guid? associationId = null;
            var associationIdClaim = User.FindFirstValue("loginId");
            if (!string.IsNullOrEmpty(associationIdClaim) && Guid.TryParse(associationIdClaim, out var assocId))
            {
                associationId = assocId;
            }

            var result = await _eventMessageService.GetUnsentMessages(isSent, associationId);
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        [Authorize(Roles = "Coalition")]
        [HttpPost]
        [Route("~/api/EventMessages/{id}/approve")]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> ApproveMessage(Guid id)
        {
            var approvedById = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? "system";
            var result = await _eventMessageService.ApproveMessage(id, approvedById);
            if (result.Success)
                return Ok(result);
            return BadRequest(result);
        }

        [Authorize(Roles = "Coalition")]
        [HttpPost]
        [Route("~/api/EventMessages/{id}/reject")]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RejectMessage(Guid id, [FromBody] string? reason = null)
        {
            var rejectedById = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? "system";
            var result = await _eventMessageService.RejectMessage(id, rejectedById, reason);
            if (result.Success)
                return Ok(result);
            return BadRequest(result);
        }
        [HttpDelete]
        [Route("~/api/EventMessages/{id}")]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeleteEventMessage(Guid id)
        {
            // Get association ID from user claims (for Association users)
            // Permission logic is handled in service, but we pass the assoc ID for verification
            Guid? associationId = null;
            var associationIdClaim = User.FindFirstValue("loginId");
            // Only parse if not Coalition/SuperAdmin - assuming specific roles have these claims
            // However, typical pattern here is to pass whatever we have.
            // If the user is coalition, this claim might differ or not exist.
            if (!string.IsNullOrEmpty(associationIdClaim) && Guid.TryParse(associationIdClaim, out var assocId))
            {
                associationId = assocId;
            }

            var result = await _eventMessageService.DeleteEventMessage(id, associationId);
            if (result.Success)
                return Ok(result);
            return BadRequest(result);
        }
    }
}
