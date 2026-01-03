using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipDigitalAPI.Controllers.Configuration
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeneralCodesController : ControllerBase
    {

        IGeneralConfigService _generalConfigService;

        public GeneralCodesController(IGeneralConfigService generalConfigService)
        {
            _generalConfigService = generalConfigService;
        }


        [HttpGet]
        [ProducesResponseType(typeof(List<GeneralCodeDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetGeneralCodesList([FromQuery] Guid? associationId = null)
        {
            return Ok(await _generalConfigService.GetGeneralCodes(associationId));
        }

        // Backwards-compatible: keep the old "generate" behavior on a dedicated route
        // GET /api/GeneralCodes/generate?generalCodeType=0&memberType=FULL
        [HttpGet("generate")]
        public async Task<IActionResult> Generate([FromQuery] GeneralCodeType generalCodeType = GeneralCodeType.MEMBERPREFIX, [FromQuery] string memberType = "FULL")
        {
            return Ok(await _generalConfigService.GenerateCode(generalCodeType, memberType));
        }

        // Create or update a GeneralCodes row for an association (upsert)
        // POST /api/GeneralCodes
        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage<Guid>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Upsert(GeneralCodeUpsertDto dto)
        {
            return Ok(await _generalConfigService.UpsertGeneralCode(dto));
        }

        // Keep the SMS endpoint but move it off the main POST route to avoid conflicts
        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage(MessageRequest messageRequest)
        {
            return Ok(await _generalConfigService.SendMessage(messageRequest));
        }
    }
}
