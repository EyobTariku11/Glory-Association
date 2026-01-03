using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.Events;

public class DonationTarget : WithIdModel
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double TargetAmount { get; set; }
    public double? AmountCollected { get; set; } = 0;
    
    // Association relationship
    public Guid AssociationId { get; set; }
    public virtual AssociationModel Association { get; set; } = null!;
    
    // Event relationship (optional - can be standalone)
    public Guid? EventId { get; set; }
    public virtual AssociationEvent? Event { get; set; }
    
    // Status
    public bool IsActive { get; set; } = true;
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovedById { get; set; }
    
    // Navigation properties
    public virtual ICollection<EventDonation> Donations { get; set; } = new List<EventDonation>();
} 