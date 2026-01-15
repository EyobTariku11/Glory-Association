using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.DTOS.Payment;
using MembershipImplementation.DTOS.Users;
using MembershipImplementation.Interfaces.HRM;

using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MembershipAPI.Controllers.Users
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _memberService;

        public MemberController(IMemberService memberService)
        {
            _memberService = memberService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(MembersGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CheckIfPhoneNumberExist(string phoneNumber)
        {
            return Ok(await _memberService.CheckPhoneNumberExist(phoneNumber));
        }


        [HttpGet]
        [ProducesResponseType(typeof(ResponseMessage2), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CheckIfPhoneNumberExistFromBot(string phoneNumber)
        {
            return Ok(await _memberService.CheckIfPhoneNumberExistFromBot(phoneNumber));
        }


        [HttpGet]
        [ProducesResponseType(typeof(MembersGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetMmebers(Guid? associationId)
        {
            // If associationId is null, it means Coalition user wants all members
            // If associationId has value, it means Association user wants their specific members
            return Ok(await _memberService.GetMembers(associationId));
        }

        [HttpGet]
        [ProducesResponseType(typeof(MembersGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetSingleMember(Guid memberId)
        {
            return Ok(await _memberService.GetSingleMember(memberId));
        }

        [HttpPost]
        [ProducesResponseType(typeof(CompleteProfileDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> CompleteProfile([FromForm] CompleteProfileDto profile)
        {
            return Ok(await _memberService.CompleteProfile(profile));
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> MakePayment(MemberPaymentDto memberPayment)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.MakePayment(memberPayment));
            }
            else
            {
                return BadRequest();
            }
        }
        [HttpGet]
        [ProducesResponseType(typeof(MemberPaymentDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetSingleMemberPayment(Guid memberId)
        {
            return Ok(await _memberService.GetSingleMemberPayment(memberId));
        }



        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> MakePaymentConfirmation(string textRn)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.MakePaymentConfirmation(textRn));
            }
            else
            {
                return BadRequest();
            }
        }


        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateMember([FromForm] MemberUpdateDto memberDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.UpdateProfile(memberDto));
            }
            else
            {
                return BadRequest();
            }
        }

        

        [HttpGet]
        [ProducesResponseType(typeof(MemberRegionRevenueReportDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetRegionReportRevenue()
        {
            return Ok(await _memberService.GetRegionRevenueReport());
        }

        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateProfileFromAdmin([FromForm] MemberUpdateDto memberDto)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.UpdateProfileFromAdmin(memberDto));
            }
            else
            {
                return BadRequest();
            }
        }




        
        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> ImportMemberFormExcel(IFormFile excelFile)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.ImportMemberFormExcel(excelFile));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpDelete]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeleteMember(Guid memberId)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.DeleteMember(memberId));
            }
            else
            {
                return BadRequest();
            }
        }


        [HttpPut]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> UpdateTextRef(string oldTextRn, string newTextRn)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.UpdateTextReference(oldTextRn, newTextRn));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetExpiredDate(DateTime lastPaid, Guid membershipTypeId)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.GetExpiredDate(lastPaid, membershipTypeId));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet]
        [ProducesResponseType(typeof(MemberVerificationDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> VerifyMember(string memberId)
        {
            if (string.IsNullOrEmpty(memberId))
            {
                return BadRequest("Member ID is required.");
            }

            var result = await _memberService.VerifyMemberById(memberId);
            return Ok(result);
        }
        

        [HttpDelete]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RemoveProfileImage(Guid memberId)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.RemoveProfileImage(memberId));
            }
            return BadRequest();
        }

    }
}
