using Implementation.DTOS.Authentication;
using Implementation.Helper;
using MembershipImplementation.DTOS.Association;
using MembershipImplementation.DTOS.Configuration;
using MembershipInfrustructure.Model.Association;

namespace MembershipImplementation.Interfaces.Association;

public interface IAssociationService
{
    Task<List<AssociationGetDto>> GetAllAsync();
    Task<AssociationGetDto?> GetByIdAsync(Guid id);
    Task<AssociationModel> CreateAsync(AssociationPostDto dto, string createdById);
    Task<AssociationModel> UpdateAsync(Guid id, AssociationPostDto dto);
    Task<ResponseMessage> DeleteAsync(Guid id);
    Task<ResponseMessage> UpdateUserAsync(string userId, AddUSerDto dto);
    Task<ResponseMessage> AddUser(AddUSerDto addUSer);

    Task<AssociationGetDto?> GetByMembershipType(Guid membershipTypeId);
    Task<ResponseMessage<List<SelectListDto>>> GetAssociationDropDown();

    Task<List<UserListDto>> GetUserList(Guid associationId);
    Task<AssociationStatsDto> GetAssociationsWithMemberCountAsync();
    Task<string?> GetArifPayKeyAsync(Guid associationId);
}