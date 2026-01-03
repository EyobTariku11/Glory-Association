namespace MembershipImplementation.DTOS.Association;

public class AssociationWithMemberCountDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string AmharicName { get; set; } = null!;
    public string LogoPath { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string WebsiteLink { get; set; } = null!;
    public string PrimaryColor { get; set; } = null!;
    public string SecondaryColor { get; set; } = null!;
    public List<string> PhoneNumbers { get; set; } = new();
    public int MemberCount { get; set; }
    public int ActiveMemberCount { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class AssociationStatsDto
{
    public List<AssociationWithMemberCountDto> Associations { get; set; } = new();
    public int TotalMembers { get; set; }
    public int TotalAssociations { get; set; }
} 