using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Advertisement;
using MembershipImplementation.DTOS.Advertisement;
using MembershipImplementation.Interfaces.Advertisement;

namespace MembershipImplementation.Services.Advertisement;

public class AdvertisementService : IAdvertisementService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public AdvertisementService(ApplicationDbContext dbContext, IWebHostEnvironment webHostEnvironment)
    {
        _dbContext = dbContext;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task<IEnumerable<AdvertisementDto>> GetAllAdvertisementsAsync()
    {
        var advertisements = await _dbContext.Advertisements
            .OrderBy(a => a.DisplayOrder)
            .ThenBy(a => a.CreatedDate)
            .Select(a => new AdvertisementDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                ImagePath = a.ImagePath,
                LinkUrl = a.LinkUrl,
                Type = a.Type,
                Position = a.Position,
                IsActive = a.IsActive,
                DisplayOrder = a.DisplayOrder,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                ClickCount = a.ClickCount,
                ViewCount = a.ViewCount,
                CreatedDate = a.CreatedDate,
                UpdatedDate = a.UpdatedDate,
                CreatedBy = a.CreatedBy,
                UpdatedBy = a.UpdatedBy,
                ShowOnHomepage = a.ShowOnHomepage,
                ShowOnNewsPage = a.ShowOnNewsPage,
                ShowOnEventsPage = a.ShowOnEventsPage,
                ShowOnClubsPage = a.ShowOnClubsPage,
                LastViewed = a.LastViewed,
                LastClicked = a.LastClicked
            })
            .ToListAsync();

        return advertisements;
    }

    public async Task<AdvertisementDto?> GetAdvertisementByIdAsync(Guid id)
    {
        var advertisement = await _dbContext.Advertisements
            .FirstOrDefaultAsync(a => a.Id == id);

        if (advertisement == null)
            return null;

        return new AdvertisementDto
        {
            Id = advertisement.Id,
            Title = advertisement.Title,
            Description = advertisement.Description,
            ImagePath = advertisement.ImagePath,
            LinkUrl = advertisement.LinkUrl,
            Type = advertisement.Type,
            Position = advertisement.Position,
            IsActive = advertisement.IsActive,
            DisplayOrder = advertisement.DisplayOrder,
            StartDate = advertisement.StartDate,
            EndDate = advertisement.EndDate,
            ClickCount = advertisement.ClickCount,
            ViewCount = advertisement.ViewCount,
            CreatedDate = advertisement.CreatedDate,
            UpdatedDate = advertisement.UpdatedDate,
            CreatedBy = advertisement.CreatedBy,
            UpdatedBy = advertisement.UpdatedBy,
            ShowOnHomepage = advertisement.ShowOnHomepage,
            ShowOnNewsPage = advertisement.ShowOnNewsPage,
            ShowOnEventsPage = advertisement.ShowOnEventsPage,
            ShowOnClubsPage = advertisement.ShowOnClubsPage,
            LastViewed = advertisement.LastViewed,
            LastClicked = advertisement.LastClicked
        };
    }

    public async Task<IEnumerable<AdvertisementDisplayDto>> GetActiveAdvertisementsByPageAsync(string pageType)
    {
        var now = DateTime.UtcNow;
        
        var advertisements = await _dbContext.Advertisements
            .Where(a => a.IsActive)
            .Where(a => a.StartDate <= now) // Start date should be in the past or now
            .Where(a => a.EndDate == null || a.EndDate >= now) // End date should be null or in the future
            .Where(a => (pageType == "homepage" && a.ShowOnHomepage) ||
                       (pageType == "news" && a.ShowOnNewsPage) ||
                       (pageType == "events" && a.ShowOnEventsPage) ||
                       (pageType == "clubs" && a.ShowOnClubsPage))
            .OrderBy(a => a.DisplayOrder)
            .ThenBy(a => a.CreatedDate)
            .Select(a => new AdvertisementDisplayDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                ImagePath = a.ImagePath,
                LinkUrl = a.LinkUrl,
                Type = a.Type,
                Position = a.Position,
                DisplayOrder = a.DisplayOrder
            })
            .ToListAsync();

        return advertisements;
    }

    public async Task<AdvertisementDto> CreateAdvertisementAsync(AdvertisementPostDto dto, string createdBy)
    {
        var advertisement = new MembershipInfrustructure.Model.Advertisement.Advertisement
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            ImagePath = string.Empty, // Will be set after file upload
            LinkUrl = dto.LinkUrl,
            Type = dto.GetTypeEnum(), // Use helper method
            Position = dto.GetPositionEnum(), // Use helper method
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            ShowOnHomepage = dto.ShowOnHomepage,
            ShowOnNewsPage = dto.ShowOnNewsPage,
            ShowOnEventsPage = dto.ShowOnEventsPage,
            ShowOnClubsPage = dto.ShowOnClubsPage,
            CreatedBy = createdBy,
            CreatedDate = DateTime.UtcNow
        };

        _dbContext.Advertisements.Add(advertisement);
        await _dbContext.SaveChangesAsync();

        // Handle image upload if provided
        if (dto.ImageFile != null)
        {
            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var fileExtension = Path.GetExtension(dto.ImageFile.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            // Validate file size (5MB = 5 * 1024 * 1024 bytes)
            if (dto.ImageFile.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("File size must be less than 5MB");
            }

            var fileName = $"{advertisement.Id}{fileExtension}";
            var advertisementDirectory = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "advertisements");
            
            // Create advertisement directory if it doesn't exist
            if (!Directory.Exists(advertisementDirectory))
            {
                Directory.CreateDirectory(advertisementDirectory);
            }

            var filePath = Path.Combine(advertisementDirectory, fileName);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ImageFile.CopyToAsync(stream);
            }

            // Update the advertisement with the image path
            advertisement.ImagePath = $"/uploads/advertisements/{fileName}";
            await _dbContext.SaveChangesAsync();
        }

        return await GetAdvertisementByIdAsync(advertisement.Id) ?? throw new InvalidOperationException("Failed to create advertisement");
    }

    public async Task<AdvertisementDto?> UpdateAdvertisementAsync(AdvertisementUpdateDto dto, string updatedBy)
    {
        var advertisement = await _dbContext.Advertisements
            .FirstOrDefaultAsync(a => a.Id == dto.Id);

        if (advertisement == null)
            return null;

        // Delete old image if exists and new image is provided
        if (dto.ImageFile != null && !string.IsNullOrEmpty(advertisement.ImagePath))
        {
            var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, advertisement.ImagePath.TrimStart('/'));
            if (File.Exists(oldImagePath))
            {
                File.Delete(oldImagePath);
            }
        }

        advertisement.Title = dto.Title;
        advertisement.Description = dto.Description;
        advertisement.LinkUrl = dto.LinkUrl;
        advertisement.Type = dto.GetTypeEnum(); // Use helper method
        advertisement.Position = dto.GetPositionEnum(); // Use helper method
        advertisement.IsActive = dto.IsActive;
        advertisement.DisplayOrder = dto.DisplayOrder;
        advertisement.StartDate = dto.StartDate;
        advertisement.EndDate = dto.EndDate;
        advertisement.ShowOnHomepage = dto.ShowOnHomepage;
        advertisement.ShowOnNewsPage = dto.ShowOnNewsPage;
        advertisement.ShowOnEventsPage = dto.ShowOnEventsPage;
        advertisement.ShowOnClubsPage = dto.ShowOnClubsPage;
        advertisement.UpdatedBy = updatedBy;
        advertisement.UpdatedDate = DateTime.UtcNow;

        // Handle new image upload if provided
        if (dto.ImageFile != null)
        {
            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var fileExtension = Path.GetExtension(dto.ImageFile.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            // Validate file size (5MB = 5 * 1024 * 1024 bytes)
            if (dto.ImageFile.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("File size must be less than 5MB");
            }

            var fileName = $"{advertisement.Id}{fileExtension}";
            var advertisementDirectory = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "advertisements");
            
            // Create advertisement directory if it doesn't exist
            if (!Directory.Exists(advertisementDirectory))
            {
                Directory.CreateDirectory(advertisementDirectory);
            }

            var filePath = Path.Combine(advertisementDirectory, fileName);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ImageFile.CopyToAsync(stream);
            }

            // Update the advertisement with the new image path
            advertisement.ImagePath = $"/uploads/advertisements/{fileName}";
        }

        await _dbContext.SaveChangesAsync();

        return await GetAdvertisementByIdAsync(advertisement.Id);
    }

    public async Task<bool> DeleteAdvertisementAsync(Guid id)
    {
        var advertisement = await _dbContext.Advertisements
            .FirstOrDefaultAsync(a => a.Id == id);

        if (advertisement == null)
            return false;

        _dbContext.Advertisements.Remove(advertisement);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> IncrementViewCountAsync(Guid id)
    {
        var advertisement = await _dbContext.Advertisements
            .FirstOrDefaultAsync(a => a.Id == id);

        if (advertisement == null)
            return false;

        advertisement.ViewCount++;
        advertisement.LastViewed = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> IncrementClickCountAsync(Guid id)
    {
        var advertisement = await _dbContext.Advertisements
            .FirstOrDefaultAsync(a => a.Id == id);

        if (advertisement == null)
            return false;

        advertisement.ClickCount++;
        advertisement.LastClicked = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<AdvertisementAnalyticsDto>> GetAdvertisementAnalyticsAsync()
    {
        var analytics = await _dbContext.Advertisements
            .OrderByDescending(a => a.ViewCount)
            .Select(a => new AdvertisementAnalyticsDto
            {
                Id = a.Id,
                Title = a.Title,
                ClickCount = a.ClickCount,
                ViewCount = a.ViewCount,
                LastViewed = a.LastViewed,
                LastClicked = a.LastClicked,
                CreatedDate = a.CreatedDate
            })
            .ToListAsync();

        return analytics;
    }
} 