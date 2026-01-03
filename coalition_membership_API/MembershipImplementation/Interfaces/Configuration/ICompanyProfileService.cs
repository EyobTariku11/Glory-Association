using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;

namespace MembershipImplementation.Interfaces.Configuration;

public interface ICompanyProfileService
{
    Task<ResponseMessage<string>> UpdateCompanyProfile(CompanyProfilePostDto companyProfilePost);
    Task<ResponseMessage<CompanyProfileGetDto>>  GetCompanyProfile(Guid? associationId = null);

}