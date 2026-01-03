namespace MembershipImplementation.DTOS.Telegram;

public record TelegramConnectRequest
{
    public Guid userId { get; set; }
    
    public string chatId { get; set; }
}