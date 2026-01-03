using MembershipImplementation.DTOS.Sponsor;

namespace MembershipImplementation.Interfaces.Sponsor
{
    public interface ISponsorService
    {
        Task<IEnumerable<SponsorDto>> GetAllSponsorsAsync();
        Task<IEnumerable<SponsorDto>> GetActiveSponsorsAsync();
        Task<SponsorDto?> GetSponsorByIdAsync(int id);
        Task<SponsorDto> CreateSponsorAsync(CreateSponsorDto createDto);
        Task<SponsorDto> UpdateSponsorAsync(UpdateSponsorDto updateDto);
        Task<bool> DeleteSponsorAsync(int id);
        Task<SponsorDto> ToggleSponsorStatusAsync(int id, bool isActive);
    }
} 