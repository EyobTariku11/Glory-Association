using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.Coalition;

public class CoalitionModel : WithIdModel
{
    public string Name { get; set; } = null!;
    public string AmharicName { get; set; } = null!;
    public string ArifPayKey { get; set; } = null!;
    
    public string Email { get; set; } = null!;
    public string LogoPath { get; set; } = null!;
    public string[] PhoneNumbers { get; set; } = Array.Empty<string>();
    public string Description { get; set; } = null!;
    public string About { get; set; } = null!;
    public string Facebook { get; set; } = null!;
    public string Telegram { get; set; } = null!;
    public string TikTok { get; set; } = null!;
}