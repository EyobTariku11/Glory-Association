using Implementation.DTOS.Authentication;
using Implementation.Helper;

namespace Implementation.Interfaces.Authentication
{
    public interface IAuthenticationService
    {
        Task<ResponseMessage<string>> Login(LoginDto login);
        Task<List<UserListDto>> GetUserList();
        Task<List<RoleDropDown>> GetRoleCategory();
        Task<List<RoleDropDown>> GetNotAssignedRole(string userId, int categoryId);
        Task<List<RoleDropDown>> GetAssignedRoles(string userId, int categoryId);
        Task<ResponseMessage> AssignRole(UserRoleDto userRole);
        Task<ResponseMessage> RevokeRole(UserRoleDto userRole);
        //Task<ResponseMessage> ChangeStatusOfUser(string userId);
        Task<ResponseMessage> AddUser(AddUSerDto addUSer);
    }
}
