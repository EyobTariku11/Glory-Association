using Microsoft.AspNetCore.Http;

namespace MembershipImplementation.DTOS.News;

public record NewsPostDto
{
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Content { get; set; } = null!;
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public bool IsBreakingNews { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public string? VideoUrl { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public Guid AssociationId { get; set; } // Will be set from authenticated user
    public IFormFile? Image { get; set; }
}

public record NewsGetDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Content { get; set; } = null!;
    public string? ImagePath { get; set; }
    public string? VideoUrl { get; set; }
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public bool IsBreakingNews { get; set; }
    public bool IsFeatured { get; set; }
    
    // Association information
    public Guid AssociationId { get; set; }
    public string AssociationName { get; set; } = null!;
    public string? AssociationLogoPath { get; set; }
    
    // Approval status
    public bool IsApproved { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovedById { get; set; }
    
    // Analytics
    public int ViewCount { get; set; }
    
    // SEO
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Slug { get; set; }
    
    // Metadata
    public DateTime CreatedDate { get; set; }
    public string CreatedById { get; set; } = null!;
    
    // Computed properties
    public string[] TagList => Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToArray() ?? Array.Empty<string>();
    public string TruncatedContent => Content.Length > 200 ? Content.Substring(0, 200) + "..." : Content;
} 