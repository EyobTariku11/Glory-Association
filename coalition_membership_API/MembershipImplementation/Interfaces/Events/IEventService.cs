using Implementation.Helper;
using MembershipImplementation.DTOS.Events;
using System.Security.Claims;

namespace MembershipImplementation.Interfaces.Events;

public interface IEventService
{
    // Event management
    Task<ResponseMessage> CreateEvent(EventPostDto eventDto, string createdById);
    Task<List<EventGetDto>> GetAllEvents();
    Task<List<EventGetDto>> GetEventsByAssociation(Guid associationId);
    Task<List<EventGetDto>> GetApprovedEvents();
    Task<EventGetDto?> GetEventById(Guid eventId);
    Task<ResponseMessage> UpdateEvent(Guid eventId, EventPostDto eventDto);
    Task<ResponseMessage> DeleteEvent(Guid eventId);
    
    // Approval workflow
    Task<ResponseMessage> ApproveEvent(Guid eventId, string approvedById);
    Task<ResponseMessage> RejectEvent(Guid eventId, string rejectedById, string? reason = null);
    Task<List<EventGetDto>> GetPendingApprovalEvents();
    
    // Donation management
    Task<ResponseMessage> CreateEventDonation(EventDonationPostDto donationDto);
    Task<List<EventDonationGetDto>> GetEventDonations(Guid eventId);
    Task<ResponseMessage> UpdateDonationPaymentStatus(Guid donationId, bool isPaid, string transactionReference);
    Task<double> GetEventTotalDonations(Guid eventId);
    
    // Dashboard/Statistics
    Task<object> GetEventStatistics(Guid associationId);
    Task<List<EventGetDto>> GetUpcomingEvents(int days = 30);
} 