using MembershipImplementation.DTOS.Telegram;
using MembershipImplementation.Interfaces.Telegram;
using Microsoft.AspNetCore.Mvc;


namespace MembershipAPI.Controllers.Telegram
{
    
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TelegramController : ControllerBase
    {
        private readonly ITelegramService _telegramService;

        public TelegramController(ITelegramService telegramService)
        {
            _telegramService = telegramService;
        }

        [HttpPost]
        public async Task<IActionResult> Connect([FromBody] TelegramConnectRequest request)
        {
            var result = await _telegramService.UpdateMember(request);
            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

    }
}