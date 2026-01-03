using Implementation.Helper;
using MembershipImplementation.DTOS.News;
using MembershipImplementation.Interfaces.News;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.News;
using Microsoft.EntityFrameworkCore;
using static MembershipInfrustructure.Data.EnumList;
using System.Text.RegularExpressions;

namespace MembershipImplementation.Services.News;

public class NewsService : INewsService
{
    private readonly ApplicationDbContext _context;

    public NewsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ResponseMessage> CreateNews(NewsPostDto newsDto, string createdById)
    {
        try
        {
            var news = new MembershipInfrustructure.Model.News.News
            {
                Title = newsDto.Title,
                SubTitle = newsDto.SubTitle,
                Content = newsDto.Content,
                Category = newsDto.Category,
                Tags = newsDto.Tags,
                IsBreakingNews = newsDto.IsBreakingNews,
                IsFeatured = newsDto.IsFeatured,
                VideoUrl = newsDto.VideoUrl,
                MetaTitle = newsDto.MetaTitle,
                MetaDescription = newsDto.MetaDescription,
                AssociationId = newsDto.AssociationId,
                IsApproved = false, // News needs coalition approval
                CreatedDate = DateTime.UtcNow,
                CreatedById = createdById,
                RowStatus = RowStatus.ACTIVE,
                Slug = GenerateSlug(newsDto.Title)
            };

            _context.News.Add(news);
            await _context.SaveChangesAsync();

            // Handle image upload after saving to get the news ID
            if (newsDto.Image != null)
            {
                var fileName = $"{news.Id}{Path.GetExtension(newsDto.Image.FileName)}";
                var filePath = Path.Combine("wwwroot", "news", fileName);
                
                // Ensure directory exists
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await newsDto.Image.CopyToAsync(stream);
                }
                
                news.ImagePath = $"/wwwroot/news/{fileName}";
                
                // Update the news with the image path
                _context.News.Update(news);
                await _context.SaveChangesAsync();
            }

            return new ResponseMessage
            {
                Success = true,
                Message = "News created successfully",
                Data = news.Id
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error creating news: {ex.Message}"
            };
        }
    }

    public async Task<List<NewsGetDto>> GetAllNews()
    {
        return await _context.News
            .Where(n => n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<List<NewsGetDto>> GetNewsByAssociation(Guid associationId)
    {
        return await _context.News
            .Where(n => n.AssociationId == associationId && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<List<NewsGetDto>> GetApprovedNews()
    {
        return await _context.News
            .Where(n => n.IsApproved && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<List<NewsGetDto>> GetFeaturedNews()
    {
        return await _context.News
            .Where(n => n.IsApproved && n.IsFeatured && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Take(6)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<List<NewsGetDto>> GetBreakingNews()
    {
        return await _context.News
            .Where(n => n.IsApproved && n.IsBreakingNews && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Take(5)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<NewsGetDto?> GetNewsById(Guid newsId)
    {
        return await _context.News
            .Where(n => n.Id == newsId && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .FirstOrDefaultAsync();
    }

    public async Task<NewsGetDto?> GetNewsBySlug(string slug)
    {
        return await _context.News
            .Where(n => n.Slug == slug && n.IsApproved && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ResponseMessage> UpdateNews(Guid newsId, NewsPostDto newsDto)
    {
        try
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
                return new ResponseMessage { Success = false, Message = "News not found" };

            news.Title = newsDto.Title;
            news.SubTitle = newsDto.SubTitle;
            news.Content = newsDto.Content;
            news.Category = newsDto.Category;
            news.Tags = newsDto.Tags;
            news.IsBreakingNews = newsDto.IsBreakingNews;
            news.IsFeatured = newsDto.IsFeatured;
            news.VideoUrl = newsDto.VideoUrl;
            news.MetaTitle = newsDto.MetaTitle;
            news.MetaDescription = newsDto.MetaDescription;
            news.Slug = GenerateSlug(newsDto.Title);

            // Handle image upload
            if (newsDto.Image != null)
            {
                var fileName = $"News_{Guid.NewGuid()}{Path.GetExtension(newsDto.Image.FileName)}";
                var filePath = Path.Combine("wwwroot", "News", fileName);
                
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await newsDto.Image.CopyToAsync(stream);
                }
                
                news.ImagePath = $"/wwwroot/News/{fileName}";
            }

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "News updated successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error updating news: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> DeleteNews(Guid newsId)
    {
        try
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
                return new ResponseMessage { Success = false, Message = "News not found" };

            news.RowStatus = RowStatus.INACTIVE;
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "News deleted successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error deleting news: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> ApproveNews(Guid newsId, string approvedById)
    {
        try
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
                return new ResponseMessage { Success = false, Message = "News not found" };

            if (news.IsApproved)
                return new ResponseMessage { Success = false, Message = "News is already approved" };

            news.IsApproved = true;
            news.ApprovedDate = DateTime.UtcNow;
            news.ApprovedById = approvedById;

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "News approved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error approving news: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> RejectNews(Guid newsId, string rejectedById, string? reason = null)
    {
        try
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
                return new ResponseMessage { Success = false, Message = "News not found" };

            news.IsApproved = false;
            news.ApprovedDate = null;
            news.ApprovedById = null;

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = $"News rejected successfully{(reason != null ? $": {reason}" : "")}"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error rejecting news: {ex.Message}"
            };
        }
    }

    public async Task<List<NewsGetDto>> GetPendingApprovalNews()
    {
        return await _context.News
            .Where(n => !n.IsApproved && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<ResponseMessage> IncrementViewCount(Guid newsId)
    {
        try
        {
            var news = await _context.News.FindAsync(newsId);
            if (news == null)
                return new ResponseMessage { Success = false, Message = "News not found" };

            news.ViewCount++;
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "View count incremented"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error incrementing view count: {ex.Message}"
            };
        }
    }

    public async Task<object> GetNewsStatistics(Guid associationId)
    {
        var totalNews = await _context.News.CountAsync(n => n.AssociationId == associationId && n.RowStatus == RowStatus.ACTIVE);
        var approvedNews = await _context.News.CountAsync(n => n.AssociationId == associationId && n.IsApproved && n.RowStatus == RowStatus.ACTIVE);
        var pendingNews = await _context.News.CountAsync(n => n.AssociationId == associationId && !n.IsApproved && n.RowStatus == RowStatus.ACTIVE);
        var totalViews = await _context.News.Where(n => n.AssociationId == associationId && n.RowStatus == RowStatus.ACTIVE).SumAsync(n => n.ViewCount);

        return new
        {
            TotalNews = totalNews,
            ApprovedNews = approvedNews,
            PendingNews = pendingNews,
            TotalViews = totalViews
        };
    }

    public async Task<List<NewsGetDto>> SearchNews(string searchTerm)
    {
        return await _context.News
            .Where(n => n.IsApproved && n.RowStatus == RowStatus.ACTIVE &&
                       (n.Title.Contains(searchTerm) || n.Content.Contains(searchTerm) || n.SubTitle.Contains(searchTerm)))
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<List<NewsGetDto>> GetNewsByCategory(string category)
    {
        return await _context.News
            .Where(n => n.IsApproved && n.Category == category && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    public async Task<List<NewsGetDto>> GetNewsByTag(string tag)
    {
        return await _context.News
            .Where(n => n.IsApproved && n.Tags.Contains(tag) && n.RowStatus == RowStatus.ACTIVE)
            .Include(n => n.Association)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new NewsGetDto
            {
                Id = n.Id,
                Title = n.Title,
                SubTitle = n.SubTitle,
                Content = n.Content,
                ImagePath = n.ImagePath,
                VideoUrl = n.VideoUrl,
                Category = n.Category,
                Tags = n.Tags,
                IsBreakingNews = n.IsBreakingNews,
                IsFeatured = n.IsFeatured,
                AssociationId = n.AssociationId,
                AssociationName = n.Association.Name,
                AssociationLogoPath = n.Association.LogoPath,
                IsApproved = n.IsApproved,
                ApprovedDate = n.ApprovedDate,
                ApprovedById = n.ApprovedById,
                ViewCount = n.ViewCount,
                MetaTitle = n.MetaTitle,
                MetaDescription = n.MetaDescription,
                Slug = n.Slug,
                CreatedDate = n.CreatedDate,
                CreatedById = n.CreatedById
            })
            .ToListAsync();
    }

    private string GenerateSlug(string title)
    {
        // Convert to lowercase and replace spaces with hyphens
        var slug = title.ToLower().Trim();
        
        // Remove special characters
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        
        // Replace multiple spaces or hyphens with single hyphen
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        
        // Remove leading/trailing hyphens
        slug = slug.Trim('-');
        
        return slug;
    }
} 