namespace MembershipImplementation.DTOS.Association;

public class AssociationGetDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string ArifPayKey { get; set; }
    public string AmharicName { get; set; }
    public string LogoPath { get; set; }
    
    public string StampPath { get; set; }
    public string StampPath2 { get; set; }
    public string? BackgroundImage { get; set; }
    public string? PhotoStamp { get; set; }
    public string SigniturePath { get; set; }
    public List<string> PhoneNumbers { get; set; }
    public string Description { get; set; }
    public string About { get; set; }
    public string WebsiteLink { get; set; }
    public string PrimaryColor { get; set; }
    public string SecondaryColor { get; set; }
    public string Facebook { get; set; }
    public string Telegram { get; set; }
    public string TikTok { get; set; }
    public DateTime CreatedDate { get; set; }
}


