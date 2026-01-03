using System.ComponentModel.DataAnnotations;

namespace MembershipInfrustructure.Model.Advertisement;

public class Advertisement
{
    public Guid Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = null!;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [StringLength(500)]
    public string ImagePath { get; set; } = null!;
    
    [StringLength(500)]
    public string? LinkUrl { get; set; }
    
    [Required]
    public AdvertisementType Type { get; set; }
    
    [Required]
    public AdvertisementPosition Position { get; set; }
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    [Required]
    public int DisplayOrder { get; set; } = 0;
    
    [Required]
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? EndDate { get; set; }
    
    [Required]
    public int ClickCount { get; set; } = 0;
    
    [Required]
    public int ViewCount { get; set; } = 0;
    
    [Required]
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedDate { get; set; }
    
    [StringLength(100)]
    public string? CreatedBy { get; set; }
    
    [StringLength(100)]
    public string? UpdatedBy { get; set; }
    
    // Targeting options
    public bool ShowOnHomepage { get; set; } = true;
    public bool ShowOnNewsPage { get; set; } = true;
    public bool ShowOnEventsPage { get; set; } = true;
    public bool ShowOnClubsPage { get; set; } = true;
    
    // Analytics
    public DateTime? LastViewed { get; set; }
    public DateTime? LastClicked { get; set; }
}

public enum AdvertisementType
{
    Banner = 1,
    Sidebar = 2,
    Popup = 3,
    Inline = 4,
    Footer = 5,
    Header = 6
}

public enum AdvertisementPosition
{
    Top = 1,
    Bottom = 2,
    Left = 3,
    Right = 4,
    Center = 5,
    Header = 6,
    Footer = 7,
    Sidebar = 8,
    Inline = 9
} 