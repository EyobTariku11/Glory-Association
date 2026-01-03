using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Model.Association;


namespace MembershipInfrustructure.Model.Message;

public class Message:WithIdModel
{
    public string Content { get; set; }
    public List<MessageType> MessageTypes { get; set; } = new List<MessageType>();
    public bool IsApproved { get; set; }
    
    public Guid AssociationId { get; set; }
    public virtual AssociationModel Association { get; set; } = null!;
  
}

public enum MessageType
{
    Email, 
    SMS,
    Telegram,
}