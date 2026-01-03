using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using MembershipInfrustructure.Model.Users;

namespace MembershipInfrustructure.Model.ETicket;

public class ETicketModel:WithIdModel
{
    
    public string TicketNumber { get; set; } = null!;
    public Guid EventId { get; set; }
    public virtual Event Event { get; set; } = null!;
    public double Price { get; set; }
    public Currency Currency { get; set; }
    public bool IsSold { get; set; } = false;
    public Guid? BuyerId { get; set; }
    public virtual Member? Buyer { get; set; }
    public DateTime? PurchaseDate { get; set; }
    
}