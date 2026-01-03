using MembershipImplementation.DTOS.Advertisement;

namespace MembershipImplementation.Interfaces.Advertisement;

public interface IAdvertisementService
{
    Task<IEnumerable<AdvertisementDto>> GetAllAdvertisementsAsync();
    Task<AdvertisementDto?> GetAdvertisementByIdAsync(Guid id);
    Task<IEnumerable<AdvertisementDisplayDto>> GetActiveAdvertisementsByPageAsync(string pageType);
    Task<AdvertisementDto> CreateAdvertisementAsync(AdvertisementPostDto dto, string createdBy);
    Task<AdvertisementDto?> UpdateAdvertisementAsync(AdvertisementUpdateDto dto, string updatedBy);
    Task<bool> DeleteAdvertisementAsync(Guid id);
    Task<bool> IncrementViewCountAsync(Guid id);
    Task<bool> IncrementClickCountAsync(Guid id);
    Task<IEnumerable<AdvertisementAnalyticsDto>> GetAdvertisementAnalyticsAsync();
} 