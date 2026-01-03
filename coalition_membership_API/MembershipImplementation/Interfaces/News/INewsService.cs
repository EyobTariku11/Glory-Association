using Implementation.Helper;
using MembershipImplementation.DTOS.News;

namespace MembershipImplementation.Interfaces.News;

public interface INewsService
{
    // News management
    Task<ResponseMessage> CreateNews(NewsPostDto newsDto, string createdById);
    Task<List<NewsGetDto>> GetAllNews();
    Task<List<NewsGetDto>> GetNewsByAssociation(Guid associationId);
    Task<List<NewsGetDto>> GetApprovedNews();
    Task<List<NewsGetDto>> GetFeaturedNews();
    Task<List<NewsGetDto>> GetBreakingNews();
    Task<NewsGetDto?> GetNewsById(Guid newsId);
    Task<NewsGetDto?> GetNewsBySlug(string slug);
    Task<ResponseMessage> UpdateNews(Guid newsId, NewsPostDto newsDto);
    Task<ResponseMessage> DeleteNews(Guid newsId);
    
    // Approval workflow
    Task<ResponseMessage> ApproveNews(Guid newsId, string approvedById);
    Task<ResponseMessage> RejectNews(Guid newsId, string rejectedById, string? reason = null);
    Task<List<NewsGetDto>> GetPendingApprovalNews();
    
    // Analytics
    Task<ResponseMessage> IncrementViewCount(Guid newsId);
    Task<object> GetNewsStatistics(Guid associationId);
    
    // Search and filtering
    Task<List<NewsGetDto>> SearchNews(string searchTerm);
    Task<List<NewsGetDto>> GetNewsByCategory(string category);
    Task<List<NewsGetDto>> GetNewsByTag(string tag);
} 