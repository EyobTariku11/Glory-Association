using Implementation.Helper;
using MembershipImplementation.DTOS.EventMessage;
using MembershipInfrustructure.Model.Message;

namespace MembershipImplementation.Interfaces.Message;

public interface IEventMessageService
{
    Task<ResponseMessage<string>> AddEventMessage(EventMessagePostDto eventMessagePost, Guid associationId); 
    
    Task<ResponseMessage<string>> UpdateEventMessage(EventMessageGetDto eventMessageGet, Guid? associationId = null); 
    Task<ResponseMessage<List<EventMessageGetDto>>> GetEventMessage(bool isApproved, Guid? associationId = null);
    Task<ResponseMessage<string>> AddEventMessageMember(EventMessageMemberPostDto eventMessageMember, Guid? associationId = null);
    Task<ResponseMessage<List<EventMessageMemberGetDto>>> GetEventMessageMember(MessageStatus? messageStatus, Guid? eventMessageId);
    
    Task<ResponseMessage<string>> ChangeMessageStatus ( List<Guid> memberMessageIds);

    public Task<ResponseMessage<List<EventMessageMemberGetDto>>> GetUnsentMessages(bool isSent, Guid? associationId = null);
    
    Task<ResponseMessage> ApproveMessage(Guid messageId, string approvedById);
    Task<ResponseMessage> RejectMessage(Guid messageId, string rejectedById, string? reason = null);
    Task<ResponseMessage> DeleteEventMessage(Guid messageId, Guid? associationId = null);
}