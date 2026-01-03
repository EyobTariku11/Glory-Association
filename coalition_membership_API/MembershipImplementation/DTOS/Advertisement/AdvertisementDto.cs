using MembershipInfrustructure.Model.Advertisement;
using Microsoft.AspNetCore.Http;

namespace MembershipImplementation.DTOS.Advertisement;

public class AdvertisementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string ImagePath { get; set; } = null!;
    public string? LinkUrl { get; set; }
    public AdvertisementType Type { get; set; }
    public AdvertisementPosition Position { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int ClickCount { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool ShowOnHomepage { get; set; }
    public bool ShowOnNewsPage { get; set; }
    public bool ShowOnEventsPage { get; set; }
    public bool ShowOnClubsPage { get; set; }
    public DateTime? LastViewed { get; set; }
    public DateTime? LastClicked { get; set; }
}

public class AdvertisementPostDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? LinkUrl { get; set; }
    public string Type { get; set; } = null!; // Changed to string
    public string Position { get; set; } = null!; // Changed to string
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public bool ShowOnHomepage { get; set; } = true;
    public bool ShowOnNewsPage { get; set; } = true;
    public bool ShowOnEventsPage { get; set; } = true;
    public bool ShowOnClubsPage { get; set; } = true;
    public IFormFile? ImageFile { get; set; }

    // Helper methods to convert string to enum
    public AdvertisementType GetTypeEnum()
    {
        return Type?.ToLower() switch
        {
            "banner" => AdvertisementType.Banner,
            "sidebar" => AdvertisementType.Sidebar,
            "popup" => AdvertisementType.Popup,
            "inline" => AdvertisementType.Inline,
            "footer" => AdvertisementType.Footer,
            "header" => AdvertisementType.Header,
            _ => AdvertisementType.Banner
        };
    }

    public AdvertisementPosition GetPositionEnum()
    {
        return Position?.ToLower() switch
        {
            "top" => AdvertisementPosition.Top,
            "bottom" => AdvertisementPosition.Bottom,
            "left" => AdvertisementPosition.Left,
            "right" => AdvertisementPosition.Right,
            "center" => AdvertisementPosition.Center,
            "header" => AdvertisementPosition.Header,
            "footer" => AdvertisementPosition.Footer,
            "sidebar" => AdvertisementPosition.Sidebar,
            "inline" => AdvertisementPosition.Inline,
            _ => AdvertisementPosition.Top
        };
    }
}

public class AdvertisementUpdateDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? LinkUrl { get; set; }
    public string Type { get; set; } = null!; // Changed to string
    public string Position { get; set; } = null!; // Changed to string
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool ShowOnHomepage { get; set; }
    public bool ShowOnNewsPage { get; set; }
    public bool ShowOnEventsPage { get; set; }
    public bool ShowOnClubsPage { get; set; }
    public IFormFile? ImageFile { get; set; }

    // Helper methods to convert string to enum
    public AdvertisementType GetTypeEnum()
    {
        return Type?.ToLower() switch
        {
            "banner" => AdvertisementType.Banner,
            "sidebar" => AdvertisementType.Sidebar,
            "popup" => AdvertisementType.Popup,
            "inline" => AdvertisementType.Inline,
            "footer" => AdvertisementType.Footer,
            "header" => AdvertisementType.Header,
            _ => AdvertisementType.Banner
        };
    }

    public AdvertisementPosition GetPositionEnum()
    {
        return Position?.ToLower() switch
        {
            "top" => AdvertisementPosition.Top,
            "bottom" => AdvertisementPosition.Bottom,
            "left" => AdvertisementPosition.Left,
            "right" => AdvertisementPosition.Right,
            "center" => AdvertisementPosition.Center,
            "header" => AdvertisementPosition.Header,
            "footer" => AdvertisementPosition.Footer,
            "sidebar" => AdvertisementPosition.Sidebar,
            "inline" => AdvertisementPosition.Inline,
            _ => AdvertisementPosition.Top
        };
    }
}

public class AdvertisementDisplayDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string ImagePath { get; set; } = null!;
    public string? LinkUrl { get; set; }
    public AdvertisementType Type { get; set; }
    public AdvertisementPosition Position { get; set; }
    public int DisplayOrder { get; set; }
}

public class AdvertisementAnalyticsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public int ClickCount { get; set; }
    public int ViewCount { get; set; }
    public DateTime? LastViewed { get; set; }
    public DateTime? LastClicked { get; set; }
    public DateTime CreatedDate { get; set; }
    public double ClickThroughRate => ViewCount > 0 ? (double)ClickCount / ViewCount * 100 : 0;
} 