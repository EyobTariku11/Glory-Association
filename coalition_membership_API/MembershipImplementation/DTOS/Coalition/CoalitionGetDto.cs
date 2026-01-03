namespace MembershipImplementation.DTOS.Coalition;

public class CoalitionGetDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string ArifPayKey { get; set; }
    public string AmharicName { get; set; }
    public string Email { get; set; }
    public string LogoPath { get; set; }
    public List<string> PhoneNumbers { get; set; }
    public string Description { get; set; }
    public string About { get; set; }
    public string Facebook { get; set; }
    public string Telegram { get; set; }
    public string TikTok { get; set; }
    public DateTime CreatedDate { get; set; }
} 