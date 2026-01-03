using Implementation.Helper;
using MembershipImplementation.DTOS.Donation;
using MembershipImplementation.DTOS.Payment;

namespace MembershipImplementation.Interfaces.Donation;

public interface IDonationEventService
{
    Task<ResponseMessage<string>> AddDonationEvent(DonationEventPostDto donationEventPostDto);
    Task<ResponseMessage<string>> UpdateDonationEvent(Guid id, DonationEventPostDto donationEventPostDto);
    Task<ResponseMessage<string>> RemoveDonationEvent(Guid id);
    Task<ResponseMessage<List<DonationEventGetDto>>> GetAllDonationEvents();
    Task<ResponseMessage<DonationEventGetDto?>> GetByIdDonation(Guid id);
    Task<ResponseMessage<string>> MakePayment(DonationPaymentDto donationPaymentDto);

    Task<ResponseMessage<string>> MakePaymentConfirmation(string txt_rn, string phoneNumber);
}