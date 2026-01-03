using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.ETicket;

public class Event : WithIdModel
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime EventDate { get; set; }
    public string Location { get; set; } = null!;
    public Guid AssociationModelId { get; set; }
    public virtual AssociationModel AssociationModel { get; set; } = null!;
    public virtual ICollection<ETicketModel> Tickets { get; set; } = new List<ETicketModel>();
}