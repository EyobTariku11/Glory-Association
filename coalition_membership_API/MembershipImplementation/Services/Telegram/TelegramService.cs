using Implementation.Helper;
using MembershipImplementation.DTOS.EventMessage;
using MembershipImplementation.DTOS.Telegram;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Interfaces.Telegram;
using MembershipInfrustructure.Data;

namespace MembershipImplementation.Services.Telegram;

public class TelegramService : ITelegramService
{
    public readonly ApplicationDbContext _dbContext;
    private readonly string _botToken;
    public TelegramService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
        _botToken = "7820281886:AAF7HTMQ-4ICN3U-ecf9y3X8TQ-hKx-Vpxs";
    }

    public async Task<ResponseMessage<string>> UpdateMember(TelegramConnectRequest connectRequest)
    {
        try
        {
            var member = await _dbContext.Members.FindAsync(connectRequest.userId);

            if (member == null)
            {
                return new ResponseMessage<string>()
                {
                    Success = false, Message = "User not found!"
                };
            }
            member.ChatId = connectRequest.chatId;

            await _dbContext.SaveChangesAsync();


            return new ResponseMessage<string>()
            {
                Success = true,
                Message = "User Update Successfully."
            };


        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException<string>(ex);
        }
    }
    
    public async Task<ResponseMessage<bool>> SendMessageAsync(string chatId, string message)
    {
        try
        {
            var telegramApiUrl = $"https://api.telegram.org/bot{_botToken}/sendMessage";
            
            var httpClient = new HttpClient();
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("chat_id", chatId),
                new KeyValuePair<string, string>("text", message)
            });

            var response = await httpClient.PostAsync(telegramApiUrl, content);

            if (response.IsSuccessStatusCode)
            {
                return new ResponseMessage<bool>
                {
                    Success = true,
                    Message = "Message sent successfully.",
                    Data = true
                };
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return new ResponseMessage<bool>
                {
                    Success = false,
                    Message = $"Failed to send message: {errorContent}",
                    Data = false
                };
            }
        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException<bool>(ex);
        }
    }

}