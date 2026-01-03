using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MembershipImplementation.DTOS.Sponsor
{
    public class SponsorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImagePath { get; set; }
        public string? WebsiteUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class CreateSponsorDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [Url]
        public string? WebsiteUrl { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public IFormFile? ImageFile { get; set; }
    }

    public class UpdateSponsorDto
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [Url]
        public string? WebsiteUrl { get; set; }
        
        public bool IsActive { get; set; }
        
        public IFormFile? ImageFile { get; set; }
    }

    public class SponsorStatusDto
    {
        public bool IsActive { get; set; }
    }
} 