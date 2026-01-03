using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Model.Users;


namespace MembershipInfrustructure.Model.Message;

public class MessageMember : WithIdModel
{
    
    public Guid MemberId { get; set; }
    public virtual Member Member { get; set; }
    
    public Guid MessageId { get; set; }
    public virtual Message Message { get; set; } 
    
    public MessageStatus? MessageStatus { get; set; }
    
}
public enum MessageStatus
{
    Pending,
    Sent
}