using System.Net;
using System.Security.Claims;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using Microsoft.AspNetCore.Mvc;

namespace MembershipAPI.Controllers.Configuration;


[Route("api/[controller]/[action]")]
[ApiController]
public class CompanyProfileController :ControllerBase
{
        ICompanyProfileService _companyProfileService;

        public CompanyProfileController(ICompanyProfileService companyProfileService)
        {
            _companyProfileService = companyProfileService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(CompanyProfileGetDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetCompanyProfile()
        {
            // Get the current user's association ID from claims
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userAssociationId = User.FindFirst("loginId")?.Value;
            
            Guid? associationId = null;
            if (userRole == "Association" && !string.IsNullOrEmpty(userAssociationId))
            {
                associationId = Guid.Parse(userAssociationId);
            }
            
            return Ok(await _companyProfileService.GetCompanyProfile(associationId));
        }
        
        
        [HttpPost]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddCompanyProfile([FromForm] CompanyProfilePostDto companyProfileDto)
        {
            // Get the current user's association ID from claims
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userAssociationId = User.FindFirst("loginId")?.Value;
            
            if (userRole == "Association" && !string.IsNullOrEmpty(userAssociationId))
            {
                companyProfileDto.AssociationId = Guid.Parse(userAssociationId);
            }
            
            return Ok(await _companyProfileService.UpdateCompanyProfile(companyProfileDto));
        }

}