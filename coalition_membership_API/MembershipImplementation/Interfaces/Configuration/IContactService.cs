using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;

namespace MembershipImplementation.Interfaces.Configuration;

public interface IContactService
{
    
    Task<ResponseMessage<string>> AddContactUs(ContactUsDto contactUsDto);
    Task<ResponseMessage<List<ContactUsDto>>>  GetContactMessages();

    
}