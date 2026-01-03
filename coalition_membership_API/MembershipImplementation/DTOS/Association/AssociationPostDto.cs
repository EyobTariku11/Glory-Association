using Microsoft.AspNetCore.Http;
using static MembershipInfrustructure.Data.EnumList;
namespace MembershipImplementation.DTOS.Association;

public class AssociationPostDto
{
    public string Name { get; set; } = null!;
    public string AmharicName { get; set; } = null!;
    public string ArifPayKey { get; set; } = null!;
    public IFormFile? Logo { get; set; } = null!;
    
    public IFormFile? Signiture { get; set; } = null!;
    public IFormFile? Stamp { get; set; } = null!;
    
    public IFormFile? Stamp2 { get; set; } = null!;
    
    public IFormFile? BackgroundImage { get; set; } = null!;
    public IFormFile? PhotoStamp { get; set; } = null!;
    
    public List<string> PhoneNumbers { get; set; } = new();
    public string Description { get; set; } = null!;
    public string About { get; set; } = null!;
    public string WebsiteLink { get; set; }
    public string PrimaryColor { get; set; }
    public string SecondaryColor { get; set; }
    public string Facebook { get; set; } = null!;
    public string Telegram { get; set; } = null!;
    public string TikTok { get; set; } = null!;
    public RowStatus RowStatus { get; set; } = RowStatus.ACTIVE;
}
