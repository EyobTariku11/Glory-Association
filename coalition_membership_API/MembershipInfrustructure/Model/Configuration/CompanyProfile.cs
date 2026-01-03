using System.ComponentModel.DataAnnotations;

namespace MembershipInfrustructure.Model.Configuration
{
    public class CompanyProfile
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string LocalTitle { get; set; }
        
        public string? DashboardImagePath { get; set; }
        
        public string? AboutLogoPath { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        [Required]
        public string LocalDescription { get; set; }
        
        [Required]
        public string AboutUs { get; set; }
        
        [Required]
        public string LocalAboutUs { get; set; }
        
        [Required]
        public string CreatedById { get; set; }
        
        public Guid? AssociationId { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        
        public DateTime? UpdatedDate { get; set; }
    }
} 