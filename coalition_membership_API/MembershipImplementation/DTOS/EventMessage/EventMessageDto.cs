using System.ComponentModel.DataAnnotations;
using MembershipInfrustructure.Model.Message;

namespace MembershipImplementation.DTOS.EventMessage;

public record EventMessagePostDto
{

    public string Content { get; set; }
    
    
    
    [Required]
    public List<MessageType> MessageTypes { get; set; } = new List<MessageType>();

    public bool IsValid()
    {
        return MessageTypes != null && MessageTypes.Distinct().Count() == MessageTypes.Count;
    }
    
}

public record EventMessageGetDto : EventMessagePostDto
{
    
    public Guid MessageId { get; set; }
    public string? MessageTypeGet { get; set; }
    public bool IsApproved { get; set; }
}


public record EventMessageMemberPostDto
{
    public List<Guid>? MemberIds { get; set; }
    public List<Guid>? MembershipIds { get; set; }
    public bool ForAllMembers { get; set; }
    public Guid EventMessageId { get; set; }
    public MessageStatus? MessageStatus { get; set; }
    
}

public record EventMessageMemberGetDto: EventMessageMemberPostDto
{
    
    public string EventMessageMemberId { get; set; }
    public string MemberName { get; set; }
    
    public string MemberPhoneNumber { get; set; }
    
    public string MessageContent { get; set; }
    
    public string MessageStatusGet { get; set; }    
    
    public string MessageTypeGet { get; set; }
    
    
}

