using System.ComponentModel;
using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.Donation;

public class DonationEvent : WithIdModel
{
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string? Description { get; set; }
    public string? ImagePath { get; set; }
    public bool IsDonation { get; set; } = false;
    public double Amount { get; set; } = 0.0;
    public Guid AssociationId { get; set; }
    public virtual AssociationModel Association { get; set; } = null!;
}