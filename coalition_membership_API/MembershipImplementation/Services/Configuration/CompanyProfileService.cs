using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace MembershipImplementation.Services.Configuration
{
    public class CompanyProfileService : ICompanyProfileService
    {
        private readonly ApplicationDbContext _dbContext;

        public CompanyProfileService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ResponseMessage<CompanyProfileGetDto>> GetCompanyProfile(Guid? associationId = null)
        {
            try
            {
                var companyProfile = await _dbContext.CompanyProfiles
                    .Where(cp => associationId == null || cp.AssociationId == associationId)
                    .FirstOrDefaultAsync();
                
                if (companyProfile == null)
                {
                                    return new ResponseMessage<CompanyProfileGetDto>
                {
                    Success = false,
                    Message = "Company profile not found",
                    Data = null
                };
                }

                // Get additional statistics - filter by association if provided
                var membersCount = await _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Where(m => associationId == null || m.MembershipType.AssociationId == associationId)
                    .CountAsync();
                
                var donationCount = await _dbContext.DonationEventDetails
                    .Include(d => d.DonationEvent)
                    .Where(d => associationId == null || d.DonationEvent.AssociationId == associationId)
                    .SumAsync(d => d.Amount);
                
                var eventsPerYear = await _dbContext.DonationEvents
                    .Where(e => (associationId == null || e.AssociationId == associationId) && e.CreatedDate.Year == DateTime.Now.Year)
                    .CountAsync();

                var companyProfileDto = new CompanyProfileGetDto
                {
                    Id = companyProfile.Id,
                    Title = companyProfile.Title,
                    LocalTitle = companyProfile.LocalTitle,
                    DashboardImagePath = companyProfile.DashboardImagePath ?? "",
                    AboutLogoPath = companyProfile.AboutLogoPath ?? "",
                    Description = companyProfile.Description,
                    LocalDescription = companyProfile.LocalDescription,
                    AboutUs = companyProfile.AboutUs,
                    LocalAboutUs = companyProfile.LocalAboutUs,
                    CreatedById = companyProfile.CreatedById,
                    AssociationId = companyProfile.AssociationId,
                    MembersCount = membersCount,
                    DonationCount = donationCount,
                    EventsPerYear = eventsPerYear
                };

                return new ResponseMessage<CompanyProfileGetDto>
                {
                    Success = true,
                    Message = "Company profile retrieved successfully",
                    Data = companyProfileDto
                };
            }
            catch (Exception ex)
            {
                return new ResponseMessage<CompanyProfileGetDto>
                {
                    Success = false,
                    Message = $"Error retrieving company profile: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ResponseMessage<string>> UpdateCompanyProfile(CompanyProfilePostDto companyProfilePost)
        {
            try
            {
                var existingProfile = await _dbContext.CompanyProfiles
                    .Where(cp => companyProfilePost.AssociationId == null || cp.AssociationId == companyProfilePost.AssociationId)
                    .FirstOrDefaultAsync();
                
                if (existingProfile == null)
                {
                    // Create new profile
                    var newProfile = new CompanyProfile
                    {
                        Id = Guid.NewGuid(),
                        Title = companyProfilePost.Title,
                        LocalTitle = companyProfilePost.LocalTitle,
                        Description = companyProfilePost.Description,
                        LocalDescription = companyProfilePost.LocalDescription,
                        AboutUs = companyProfilePost.AboutUs,
                        LocalAboutUs = companyProfilePost.LocalAboutUs,
                        CreatedById = companyProfilePost.CreatedById,
                        AssociationId = companyProfilePost.AssociationId,
                        CreatedDate = DateTime.Now
                    };

                    // Handle file uploads
                    if (companyProfilePost.DashboardImage != null)
                    {
                        newProfile.DashboardImagePath = await UploadFile(companyProfilePost.DashboardImage, "dashboard-image", "CompanyProfile");
                    }

                    if (companyProfilePost.AboutUsLogoPath != null)
                    {
                        newProfile.AboutLogoPath = await UploadFile(companyProfilePost.AboutUsLogoPath, "about-logo", "CompanyProfile");
                    }

                    _dbContext.CompanyProfiles.Add(newProfile);
                }
                else
                {
                    // Update existing profile
                    existingProfile.Title = companyProfilePost.Title;
                    existingProfile.LocalTitle = companyProfilePost.LocalTitle;
                    existingProfile.Description = companyProfilePost.Description;
                    existingProfile.LocalDescription = companyProfilePost.LocalDescription;
                    existingProfile.AboutUs = companyProfilePost.AboutUs;
                    existingProfile.LocalAboutUs = companyProfilePost.LocalAboutUs;
                    existingProfile.UpdatedDate = DateTime.Now;

                    // Handle file uploads
                    if (companyProfilePost.DashboardImage != null)
                    {
                        existingProfile.DashboardImagePath = await UploadFile(companyProfilePost.DashboardImage, "dashboard-image", "CompanyProfile");
                    }

                    if (companyProfilePost.AboutUsLogoPath != null)
                    {
                        existingProfile.AboutLogoPath = await UploadFile(companyProfilePost.AboutUsLogoPath, "about-logo", "CompanyProfile");
                    }

                    _dbContext.CompanyProfiles.Update(existingProfile);
                }

                await _dbContext.SaveChangesAsync();

                return new ResponseMessage<string>
                {
                    Success = true,
                    Message = "Company profile updated successfully",
                    Data = "Success"
                };
            }
            catch (Exception ex)
            {
                return new ResponseMessage<string>
                {
                    Success = false,
                    Message = $"Error updating company profile: {ex.Message}",
                    Data = null
                };
            }
        }

        private async Task<string> UploadFile(IFormFile file, string fileName, string folderName)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var path = Path.Combine("wwwroot", folderName);
            string pathToSave = Path.Combine(Directory.GetCurrentDirectory(), path);

            if (!Directory.Exists(pathToSave))
                Directory.CreateDirectory(pathToSave);

            try
            {
                string fileExtension = Path.GetExtension(file.FileName);
                string fullFileName = $"{fileName}_{DateTime.Now:yyyyMMddHHmmss}{fileExtension}";
                string filePath = Path.Combine(pathToSave, fullFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Path.Combine(folderName, fullFileName);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading file: {ex.Message}");
            }
        }
    }
} 