using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.News;

public class News : WithIdModel
{
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Content { get; set; } = null!;
    public string? ImagePath { get; set; }
    public string? VideoUrl { get; set; }
    
    // News specific fields
    public string? Category { get; set; } // e.g., "Match Report", "Transfer News", "Club News", "League News"
    public string? Tags { get; set; } // Comma-separated tags
    public bool IsBreakingNews { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    
    // Approval workflow
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovedById { get; set; }
    
    // Association relationship
    public Guid AssociationId { get; set; }
    public virtual AssociationModel Association { get; set; } = null!;
    
    // View count for analytics
    public int ViewCount { get; set; } = 0;
    
    // SEO fields
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Slug { get; set; } // URL-friendly title
} 