using Implementation.DTOS.Authentication;
using Implementation.Helper;
using MembershipImplementation.DTOS.Association;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Association;
using MembershipImplementation.Interfaces.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MembershipImplementation.Services.Association;

public class AssociationService :IAssociationService
{
    private readonly ApplicationDbContext _context;
    private readonly IGeneralConfigService _generalConfig;
    private UserManager<ApplicationUser> _userManager;
    public AssociationService(ApplicationDbContext context,IGeneralConfigService generalConfig,UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _generalConfig =generalConfig;
        _userManager = userManager;
    }

    public async Task<List<AssociationGetDto>> GetAllAsync()
    {
        return await _context.Associations
            .Where(a => a.RowStatus == EnumList.RowStatus.ACTIVE)
            .Select(a => new AssociationGetDto
            {
                Id = a.Id,
                Name = a.Name,
                AmharicName = a.AmharicName,
                LogoPath = a.LogoPath,
                PhoneNumbers = (a.PhoneNumbers ?? Array.Empty<string>()).ToList(),
                ArifPayKey = a.ArifPayKey,
                StampPath = a.StampPath,
                StampPath2 = a.StampPath2,
                BackgroundImage = a.BackgroundImage,
                PhotoStamp = a.PhotoStamp,
                SigniturePath = a.SigniturePath,
                Description = a.Description,
                About = a.About,
                WebsiteLink = a.WebsiteLink,
                PrimaryColor = a.PrimaryColor,
                SecondaryColor = a.SecondaryColor,
                Facebook = a.Facebook,
                Telegram = a.Telegram,
                TikTok = a.TikTok,
                CreatedDate = a.CreatedDate
            })
            .ToListAsync();
    }

    public async Task<AssociationGetDto?> GetByIdAsync(Guid id)
    {
        var a = await _context.Associations.FirstOrDefaultAsync(x => x.Id == id);
        if (a == null || a.RowStatus != EnumList.RowStatus.ACTIVE) return null;

        return new AssociationGetDto
        {
            Id = a.Id,
            Name = a.Name,
            ArifPayKey = a.ArifPayKey,
            AmharicName = a.AmharicName,
            LogoPath = a.LogoPath,
            PhoneNumbers = a.PhoneNumbers.ToList(),
            StampPath = a.StampPath,
            StampPath2 = a.StampPath2,
            BackgroundImage = a.BackgroundImage,
            PhotoStamp = a.PhotoStamp,
            SigniturePath = a.SigniturePath,
            Description = a.Description,
            About = a.About,
            WebsiteLink = a.WebsiteLink,
            PrimaryColor = a.PrimaryColor,
            SecondaryColor = a.SecondaryColor,
            Facebook = a.Facebook,
            Telegram = a.Telegram,
            TikTok = a.TikTok,
            CreatedDate = a.CreatedDate
        };
    }

    
    public async Task<AssociationGetDto?> GetByMembershipType(Guid membershipTypeId)
    {
        
        var membershipType = await _context.MembershipTypes.FirstOrDefaultAsync(x => x.Id == membershipTypeId);
        
        
        
        var a = await _context.Associations.FirstOrDefaultAsync(x => x.Id == membershipType.AssociationId);
        if (a == null || a.RowStatus != EnumList.RowStatus.ACTIVE) return null;

        return new AssociationGetDto
        {
            Id = a.Id,
            Name = a.Name,
            ArifPayKey = a.ArifPayKey,
            AmharicName = a.AmharicName,
            LogoPath = a.LogoPath,
            StampPath = a.StampPath,
            StampPath2 = a.StampPath2,
            BackgroundImage = a.BackgroundImage,
            PhotoStamp = a.PhotoStamp,
            SigniturePath = a.SigniturePath,
            
            PhoneNumbers = a.PhoneNumbers.ToList(),
            Description = a.Description,
            About = a.About,
            WebsiteLink = a.WebsiteLink,
            PrimaryColor = a.PrimaryColor,
            SecondaryColor = a.SecondaryColor,
            Facebook = a.Facebook,
            Telegram = a.Telegram,
            TikTok = a.TikTok,
            CreatedDate = a.CreatedDate
        };
    }

    public async Task<AssociationModel> CreateAsync(AssociationPostDto dto, string createdById)
    {
        
        var entity = new AssociationModel
        {
            Name = dto.Name,
            AmharicName = dto.AmharicName,
            ArifPayKey = dto.ArifPayKey,
           
            PhoneNumbers = dto.PhoneNumbers.ToArray(),
            Description = dto.Description,
            About = dto.About,
            WebsiteLink = dto.WebsiteLink,
            PrimaryColor = dto.PrimaryColor,
            SecondaryColor = dto.SecondaryColor,
            Facebook = dto.Facebook,
            Telegram = dto.Telegram,
            TikTok = dto.TikTok,
            CreatedById = createdById,
            RowStatus = EnumList.RowStatus.ACTIVE
        };
        
        if (dto.Logo != null)
        {
            entity.LogoPath = await _generalConfig.UploadFiles(dto.Logo, entity.Name, "Association");
           
        }
        if (dto.Signiture != null)
        {
            entity.SigniturePath = await _generalConfig.UploadFiles(dto.Signiture, entity.Name+"_signiture", "Association");
           
        }

        if (dto.Stamp != null)
        {
            entity.StampPath = await _generalConfig.UploadFiles(dto.Stamp, entity.Name+"_stamp", "Association");
           
        }

        if (dto.Stamp2 != null)
        {
            entity.StampPath2 = await _generalConfig.UploadFiles(dto.Stamp2, entity.Name+"_stamp2", "Association");
           
        }

        if (dto.BackgroundImage != null)
        {
            entity.BackgroundImage = await _generalConfig.UploadFiles(dto.BackgroundImage, entity.Name+"_background", "Association");
        }

        if (dto.PhotoStamp != null)
        {
            entity.PhotoStamp = await _generalConfig.UploadFiles(dto.PhotoStamp, entity.Name+"_photostamp", "Association");
        }



        _context.Associations.Add(entity);
        await _context.SaveChangesAsync();

        return entity;
    }
    
    public async Task<AssociationModel> UpdateAsync(Guid id, AssociationPostDto dto)
    {
        var entity = await _context.Associations.FirstOrDefaultAsync(x => x.Id == id );
        if (entity == null)
            throw new Exception("Association not found.");

        entity.Name = dto.Name;
        entity.AmharicName = dto.AmharicName;
        entity.ArifPayKey = dto.ArifPayKey;
        entity.PhoneNumbers = dto.PhoneNumbers.ToArray();
        entity.Description = dto.Description;
        entity.About = dto.About;
        entity.WebsiteLink = dto.WebsiteLink;
        entity.PrimaryColor = dto.PrimaryColor;
        entity.SecondaryColor = dto.SecondaryColor;
        entity.Facebook = dto.Facebook;
        entity.Telegram = dto.Telegram;
        entity.TikTok = dto.TikTok;
    
        if(dto.RowStatus!=EnumList.RowStatus.ACTIVE)
        entity.RowStatus = dto.RowStatus;

        if (dto.Logo != null)
        {
            entity.LogoPath = await _generalConfig.UploadFiles(dto.Logo, entity.Name, "Association");
        }
        if (dto.Signiture != null)
        {
            entity.SigniturePath = await _generalConfig.UploadFiles(dto.Signiture, entity.Name + "_signiture", "Association");
        }
        if (dto.Stamp != null)
        {
            entity.StampPath = await _generalConfig.UploadFiles(dto.Stamp, entity.Name + "_stamp", "Association");
        }
        if (dto.Stamp2 != null)
        {
            entity.StampPath2 = await _generalConfig.UploadFiles(dto.Stamp2, entity.Name + "_stamp2", "Association");
        }
        if (dto.BackgroundImage != null)
        {
            entity.BackgroundImage = await _generalConfig.UploadFiles(dto.BackgroundImage, entity.Name + "_background", "Association");
        }
        if (dto.PhotoStamp != null)
        {
            entity.PhotoStamp = await _generalConfig.UploadFiles(dto.PhotoStamp, entity.Name + "_photostamp", "Association");
        }

        await _context.SaveChangesAsync();
        return entity;
    }

    
    public async Task<ResponseMessage> DeleteAsync(Guid id)
    {

        var membershipTypeExist = await _context.MembershipTypes.AnyAsync(x => x.AssociationId == id);

        if (membershipTypeExist)
        {
            return new ResponseMessage()
            {
                Success = false, Message = "Membership type exists so you cannot delete association!"
            };
        }
        var entity = await _context.Associations.FirstOrDefaultAsync(x => x.Id == id );
        if (entity == null)
            return new ResponseMessage()
            {
                Success = false, Message = "Association not found!"
            };


        _context.Associations.Remove(entity);
        await _context.SaveChangesAsync();
        
        return new ResponseMessage()
        {
            Success = true, Message = "Association has been deleted!"
        };
    }

    public async Task<ResponseMessage> AddUser(AddUSerDto addUSer)
    {

        if (addUSer.MemberId != Guid.Empty)
        {
            
            var currentEmployee = _userManager.Users.Any(x => x.UserName.Equals(addUSer.UserName));
            if (currentEmployee)
                return new ResponseMessage { Success = false, Message = "User Already Exists" };

          

            var applicationUser = new ApplicationUser
            {
                AssociationId = addUSer.AssociationId,
                Email = addUSer.Email,
                UserName = addUSer.UserName,
                RowStatus = EnumList.RowStatus.ACTIVE,
            };

            var response = await _userManager.CreateAsync(applicationUser, addUSer.Password);
        }
        return new ResponseMessage { Success = true, Message = "Succesfully Added User" };
        
    }
    
    
    
    public async Task<ResponseMessage> UpdateUserAsync(string userId, AddUSerDto dto)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null)
            return new ResponseMessage { Success = false, Message = "User not found." };

        // Check for duplicate username
        var userNameExists = await _userManager.Users.AnyAsync(x => x.UserName == dto.UserName && x.Id != userId);
        if (userNameExists)
            return new ResponseMessage { Success = false, Message = "Username already in use." };

        user.Email = dto.Email;
        user.UserName = dto.UserName;
        user.RowStatus = dto.RowStatus;
       

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return new ResponseMessage { Success = false, Message = "Failed to update user details." };

        // Handle password update if new password is provided
        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            // Remove current password if set
            var hasPassword = await _userManager.HasPasswordAsync(user);
            IdentityResult passwordResult;

            if (hasPassword)
            {
                passwordResult = await _userManager.RemovePasswordAsync(user);
                if (!passwordResult.Succeeded)
                    return new ResponseMessage { Success = false, Message = "Failed to remove current password." };
            }

            // Add new password
            passwordResult = await _userManager.AddPasswordAsync(user, dto.Password);
            if (!passwordResult.Succeeded)
                return new ResponseMessage { Success = false, Message = "Failed to update password." };
        }

        return new ResponseMessage { Success = true, Message = "User updated successfully." };
    }


    public async Task<List<UserListDto>> GetUserList(Guid associationId)
    {
        var userList = await _userManager.Users.Where(x=>x.AssociationId==associationId).ToListAsync();
        var userLists = new List<UserListDto>();

        foreach (var user in userList)
        {
                var userListt = new UserListDto()
                {
                    Id = user.Id,
                    UserId = user.AssociationId,
                    UserName = user.UserName,
                    Name = user.UserName,
                    Status = user.RowStatus.ToString(),
                    ImagePath = "",
                    Email = user.Email,
                    Roles = new List<RoleDropDown>()
                    {
                        
                    }

                };
              
                userLists.Add(userListt);
            }
            
        
        return userLists;
    }


    public async Task<ResponseMessage<List<SelectListDto>>> GetAssociationDropDown()
    {
        try
        {
            var response = await _context.Associations
                .Where(a => a.RowStatus == EnumList.RowStatus.ACTIVE)
                .Select(x => new SelectListDto()
                {
                    Id = x.Id,
                    Name = x.Name,
                    ImagePath = x.LogoPath,
                    Amount = 0 // Default amount for associations
                }).ToListAsync();

            return new  ResponseMessage<List<SelectListDto>>()
            {
                Success = true,
                Data = response
            };

        }
        catch (Exception ex)
        {
            return new ResponseMessage<List<SelectListDto>>()
            {
                Success = false, Message = ex.Message
            };
        }
        
    }

    public async Task<string?> GetArifPayKeyAsync(Guid associationId)
    {
        var association = await _context.Associations
            .Where(a => a.Id == associationId && a.RowStatus == EnumList.RowStatus.ACTIVE)
            .Select(a => a.ArifPayKey)
            .FirstOrDefaultAsync();
        
        return association;
    }

    public async Task<AssociationStatsDto> GetAssociationsWithMemberCountAsync()
    {
        var associationsWithMemberCounts = await _context.Associations
            .Where(a => a.RowStatus == EnumList.RowStatus.ACTIVE)
            .Select(a => new AssociationWithMemberCountDto
            {
                Id = a.Id,
                Name = a.Name,
                AmharicName = a.AmharicName,
                LogoPath = a.LogoPath,
                Description = a.Description,
                WebsiteLink = a.WebsiteLink,
                PrimaryColor = a.PrimaryColor,
                SecondaryColor = a.SecondaryColor,
                PhoneNumbers = (a.PhoneNumbers ?? Array.Empty<string>()).ToList(),
                CreatedDate = a.CreatedDate,
                MemberCount = a.MembershipTypes
                    .SelectMany(mt => mt.Members)
                    .Count(),
                ActiveMemberCount = a.MembershipTypes
                    .SelectMany(mt => mt.Members)
                    .Count(m => m.RowStatus == EnumList.RowStatus.ACTIVE)
            })
            .OrderByDescending(a => a.MemberCount)
            .ToListAsync();

        var totalMembers = await _context.Members.CountAsync(m => m.RowStatus == EnumList.RowStatus.ACTIVE);
        var totalAssociations = associationsWithMemberCounts.Count;

        return new AssociationStatsDto
        {
            Associations = associationsWithMemberCounts,
            TotalMembers = totalMembers,
            TotalAssociations = totalAssociations
        };
    }


}