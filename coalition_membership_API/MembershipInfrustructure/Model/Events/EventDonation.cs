using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Users;

namespace MembershipInfrustructure.Model.Events;

public class EventDonation : WithIdModel
{
    public Guid EventId { get; set; }
    public virtual AssociationEvent Event { get; set; } = null!;
    
    // Donor information
    public string? DonorName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    
    // Payment information
    public double Amount { get; set; }
    public string TransactionReference { get; set; } = null!;
    public bool IsPaid { get; set; } = false;
    public DateTime? PaymentDate { get; set; }
    
    // Optional: Link to member if they're logged in
    public Guid? MemberId { get; set; }
    public virtual Member? Member { get; set; }
    
    // Payment method
    public string? PaymentMethod { get; set; } // e.g., "ArifPay", "Bank Transfer", etc.
    public string? PaymentStatus { get; set; } // e.g., "Pending", "Completed", "Failed"
} 