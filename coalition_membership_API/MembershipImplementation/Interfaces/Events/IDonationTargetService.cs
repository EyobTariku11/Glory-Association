using Implementation.Helper;
using MembershipImplementation.DTOS.Events;
using MembershipInfrustructure.Model.Events;

namespace MembershipImplementation.Interfaces.Events;

public interface IDonationTargetService
{
    // Donation target management
    Task<ResponseMessage> CreateDonationTarget(DonationTargetPostDto donationTargetDto, string createdById);
    Task<List<DonationTargetGetDto>> GetAllDonationTargets();
    Task<List<DonationTargetGetDto>> GetDonationTargetsByAssociation(Guid associationId);
    Task<List<DonationTargetGetDto>> GetApprovedDonationTargets();
    Task<DonationTargetGetDto?> GetDonationTargetById(Guid donationTargetId);
    Task<ResponseMessage> UpdateDonationTarget(Guid donationTargetId, DonationTargetPostDto donationTargetDto);
    Task<ResponseMessage> DeleteDonationTarget(Guid donationTargetId);
    
    // Approval workflow
    Task<ResponseMessage> ApproveDonationTarget(Guid donationTargetId, string approvedById);
    Task<ResponseMessage> RejectDonationTarget(Guid donationTargetId, string rejectedById, string? reason = null);
    Task<List<DonationTargetGetDto>> GetPendingApprovalDonationTargets();
    
    // Donation management
    Task<ResponseMessage> CreateDonationForTarget(Guid donationTargetId, EventDonationPostDto donationDto);
    Task<List<EventDonationGetDto>> GetDonationsForTarget(Guid donationTargetId);
    Task<double> GetDonationTargetTotalDonations(Guid donationTargetId);
    
    // Statistics
    Task<object> GetDonationTargetStatistics(Guid associationId);
    
    // Payment status management
    Task<EventDonation?> GetDonationByReference(string reference);
    Task<ResponseMessage> UpdateDonationPaymentStatus(string reference, string status, string? sessionId);
} 