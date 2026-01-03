using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Sponsor;
using MembershipImplementation.DTOS.Sponsor;
using MembershipImplementation.Interfaces.Sponsor;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace MembershipImplementation.Services.Sponsor
{
    public class SponsorService : ISponsorService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public SponsorService(ApplicationDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<IEnumerable<SponsorDto>> GetAllSponsorsAsync()
        {
            var sponsors = await _context.Sponsors
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();

            return sponsors.Select(MapToDto);
        }

        public async Task<IEnumerable<SponsorDto>> GetActiveSponsorsAsync()
        {
            var sponsors = await _context.Sponsors
                .Where(s => s.IsActive)
                .OrderByDescending(s => s.CreatedDate)
                .ToListAsync();

            return sponsors.Select(MapToDto);
        }

        public async Task<SponsorDto?> GetSponsorByIdAsync(int id)
        {
            var sponsor = await _context.Sponsors.FindAsync(id);
            return sponsor != null ? MapToDto(sponsor) : null;
        }

        public async Task<SponsorDto> CreateSponsorAsync(CreateSponsorDto createDto)
        {
            try
            {
                var sponsor = new MembershipInfrustructure.Model.Sponsor.Sponsor
                {
                    Name = createDto.Name,
                    WebsiteUrl = createDto.WebsiteUrl,
                    IsActive = createDto.IsActive,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };

                _context.Sponsors.Add(sponsor);
                await _context.SaveChangesAsync();

                // Handle image upload if provided
                if (createDto.ImageFile != null)
                {
                    // Validate file type
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                    var fileExtension = Path.GetExtension(createDto.ImageFile.FileName).ToLowerInvariant();
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        throw new ArgumentException($"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}");
                    }

                    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
                    if (createDto.ImageFile.Length > 5 * 1024 * 1024)
                    {
                        throw new ArgumentException("File size must be less than 5MB");
                    }

                    var fileName = $"{sponsor.Name.Replace(" ", "_").ToLower()}{fileExtension}";
                    var sponsorDirectory = Path.Combine(_webHostEnvironment.WebRootPath, "sponsor");
                    
                    // Create sponsor directory if it doesn't exist
                    if (!Directory.Exists(sponsorDirectory))
                    {
                        Directory.CreateDirectory(sponsorDirectory);
                    }

                    var filePath = Path.Combine(sponsorDirectory, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await createDto.ImageFile.CopyToAsync(stream);
                    }

                    // Update the sponsor with the image path
                    sponsor.ImagePath = $"/sponsor/{fileName}";
                    await _context.SaveChangesAsync();
                }

                return MapToDto(sponsor);
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error creating sponsor: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<SponsorDto> UpdateSponsorAsync(UpdateSponsorDto updateDto)
        {
            try
            {
                var sponsor = await _context.Sponsors.FindAsync(updateDto.Id);
                if (sponsor == null)
                    throw new ArgumentException("Sponsor not found");

                // Delete old image if exists and new image is provided
                if (updateDto.ImageFile != null && !string.IsNullOrEmpty(sponsor.ImagePath))
                {
                    var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, sponsor.ImagePath.TrimStart('/'));
                    if (File.Exists(oldImagePath))
                    {
                        File.Delete(oldImagePath);
                    }
                }

                sponsor.Name = updateDto.Name;
                sponsor.WebsiteUrl = updateDto.WebsiteUrl;
                sponsor.IsActive = updateDto.IsActive;
                sponsor.UpdatedDate = DateTime.UtcNow;

                // Handle new image upload if provided
                if (updateDto.ImageFile != null)
                {
                    // Validate file type
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                    var fileExtension = Path.GetExtension(updateDto.ImageFile.FileName).ToLowerInvariant();
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        throw new ArgumentException($"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}");
                    }

                    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
                    if (updateDto.ImageFile.Length > 5 * 1024 * 1024)
                    {
                        throw new ArgumentException("File size must be less than 5MB");
                    }

                    var fileName = $"{sponsor.Name.Replace(" ", "_").ToLower()}{fileExtension}";
                    var sponsorDirectory = Path.Combine(_webHostEnvironment.WebRootPath, "sponsor");
                    
                    // Create sponsor directory if it doesn't exist
                    if (!Directory.Exists(sponsorDirectory))
                    {
                        Directory.CreateDirectory(sponsorDirectory);
                    }

                    var filePath = Path.Combine(sponsorDirectory, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await updateDto.ImageFile.CopyToAsync(stream);
                    }

                    // Update the sponsor with the new image path
                    sponsor.ImagePath = $"/sponsor/{fileName}";
                }

                await _context.SaveChangesAsync();

                return MapToDto(sponsor);
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error updating sponsor: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> DeleteSponsorAsync(int id)
        {
            var sponsor = await _context.Sponsors.FindAsync(id);
            if (sponsor == null)
                return false;

            // Delete associated image if exists
            if (!string.IsNullOrEmpty(sponsor.ImagePath))
            {
                var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, sponsor.ImagePath.TrimStart('/'));
                if (File.Exists(imagePath))
                {
                    File.Delete(imagePath);
                }
            }

            _context.Sponsors.Remove(sponsor);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<SponsorDto> ToggleSponsorStatusAsync(int id, bool isActive)
        {
            var sponsor = await _context.Sponsors.FindAsync(id);
            if (sponsor == null)
                throw new ArgumentException("Sponsor not found");

            sponsor.IsActive = isActive;
            sponsor.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(sponsor);
        }

        private static SponsorDto MapToDto(MembershipInfrustructure.Model.Sponsor.Sponsor sponsor)
        {
            return new SponsorDto
            {
                Id = sponsor.Id,
                Name = sponsor.Name,
                ImagePath = sponsor.ImagePath,
                WebsiteUrl = sponsor.WebsiteUrl,
                IsActive = sponsor.IsActive,
                CreatedDate = sponsor.CreatedDate,
                UpdatedDate = sponsor.UpdatedDate
            };
        }
    }
} 