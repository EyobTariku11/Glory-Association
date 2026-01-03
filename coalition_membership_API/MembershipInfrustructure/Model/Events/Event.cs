using System.ComponentModel;
using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.Events;

public class AssociationEvent : WithIdModel
{
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Description { get; set; } = null!;
    public string? ImagePath { get; set; }
    
    // Event specific fields
    public DateTime EventDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Location { get; set; } = null!;
    public string? EventType { get; set; } // e.g., "Tournament", "Training", "Meeting", etc.
    
    // Donation capabilities
    public bool IsDonationEnabled { get; set; } = false;
    public double? TargetAmount { get; set; }
    public double? AmountCollected { get; set; }
    
    // Approval workflow
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovedById { get; set; }
    
    // Association relationship
    public Guid AssociationId { get; set; }
    public virtual AssociationModel Association { get; set; } = null!;
    
    // Navigation properties
    public virtual ICollection<EventDonation> Donations { get; set; } = new List<EventDonation>();
} 