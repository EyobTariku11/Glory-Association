using System.ComponentModel.DataAnnotations;

namespace MembershipInfrustructure.Model.Sponsor
{
    public class Sponsor
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? ImagePath { get; set; }
        
        [StringLength(500)]
        public string? WebsiteUrl { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
    }
} 