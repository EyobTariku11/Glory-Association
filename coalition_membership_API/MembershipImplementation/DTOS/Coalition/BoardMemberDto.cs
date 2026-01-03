using Microsoft.AspNetCore.Http;

namespace MembershipImplementation.DTOS.Coalition;

public class BoardMemberDto
{
    public string? Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public string Position { get; set; } = string.Empty;
    public string? PhotoPath { get; set; }
    public bool IsActive { get; set; }
    public Guid CoalitionId { get; set; } = Guid.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

public class BoardMemberPostDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public string Position { get; set; } = string.Empty;
    public IFormFile? Photo { get; set; }
    public Guid CoalitionId { get; set; } = Guid.Empty;
}

public class BoardMemberUpdateDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public string Position { get; set; } = string.Empty;
    public IFormFile? Photo { get; set; }
    public bool IsActive { get; set; }
} 