using Microsoft.AspNetCore.Http;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.DTOS.Coalition;

public class CoalitionPostDto
{
    public string Name { get; set; } = null!;
    public string AmharicName { get; set; } = null!;
    public string ArifPayKey { get; set; } = null!;
    public string Email { get; set; } = null!;
    public IFormFile? Logo { get; set; } = null!;
    public List<string> PhoneNumbers { get; set; } = new();
    public string Description { get; set; } = null!;
    public string About { get; set; } = null!;
    public string Facebook { get; set; } = null!;
    public string Telegram { get; set; } = null!;
    public string TikTok { get; set; } = null!;
    public RowStatus RowStatus { get; set; } = RowStatus.ACTIVE;
} 