using System.ComponentModel;
using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Users;

namespace MembershipInfrustructure.Model.Donation;

public class DonationEventDetail : WithIdModel
{
    public Guid DonationEventId { get; set; }
    public virtual DonationEvent DonationEvent { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string TransactionReference { get; set; } = null!;
    public double Amount { get; set; }
    public bool IsPaid { get; set; } = false;
}