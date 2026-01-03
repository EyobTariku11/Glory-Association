using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using MembershipInfrustructure.Model.ETicket;

namespace MembershipInfrustructure.Model.Association;

public class AssociationModel : WithIdModel
{
    public string Name { get; set; } = null!;
    public string AmharicName { get; set; } = null!;
    public string ArifPayKey { get; set; } = null!;
    public string LogoPath { get; set; } = null!;

    public string SigniturePath { get; set; } = null!;

    public string StampPath { get; set; } = null!;

    public string StampPath2 { get; set; } = null;

    public string? BackgroundImage { get; set; } = null;
    public string? PhotoStamp { get; set; } = null;
    public string[] PhoneNumbers { get; set; } = Array.Empty<string>();
    public string Description { get; set; } = null!;
    public string About { get; set; } = null!;
    public string WebsiteLink { get; set; }
    
    public string PrimaryColor { get; set; }
    public string SecondaryColor { get; set; }
    
    public string Facebook { get; set; } = null!;
    public string Telegram { get; set; } = null!;
    public string TikTok { get; set; } = null!;
    
    public virtual ICollection<ETicketModel> Events { get; set; } = new List<ETicketModel>();
    public virtual ICollection<MembershipType> MembershipTypes { get; set; } = new List<MembershipType>();
}