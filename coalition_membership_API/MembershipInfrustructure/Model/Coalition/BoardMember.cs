using System.ComponentModel.DataAnnotations;
using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.Coalition;

public class BoardMember : WithIdModel
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Position { get; set; } = string.Empty;
    
    [StringLength(255)]
    public string? PhotoPath { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedDate { get; set; }
    
    // Navigation property to Coalition
    public Guid CoalitionId { get; set; }
    public virtual CoalitionModel? Coalition { get; set; }
} 