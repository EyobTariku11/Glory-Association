using MembershipImplementation.DTOS.Coalition;
using MembershipImplementation.DTOS.Users;

namespace MembershipImplementation.Interfaces.Coalition;

public interface ICoalitionService
{
    Task<CoalitionGetDto> GetByIdAsync(Guid id);
    Task<CoalitionGetDto> CreateAsync(CoalitionPostDto dto, string createdById);
    Task<CoalitionGetDto> UpdateAsync(Guid id, CoalitionPostDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<List<CoalitionGetDto>> GetAllAsync();
} 