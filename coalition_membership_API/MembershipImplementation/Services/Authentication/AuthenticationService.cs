using Implementation.DTOS.Authentication;

using Implementation.Helper;
using Implementation.Interfaces.Authentication;
using MembershipImplementation.DTOS.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using static MembershipInfrustructure.Data.EnumList;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Linq;

namespace Implementation.Services.Authentication
{

    public class AuthenticationService : IAuthenticationService
    {
        private UserManager<ApplicationUser> _userManager;
        private RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public AuthenticationService(UserManager<ApplicationUser> userManager,
            ApplicationDbContext dbContext,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _dbContext = dbContext;
            _configuration = configuration;

        }


        public async Task<ResponseMessage<string>> Login(LoginDto login)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(login.UserName);
                
                // Alias 'Glory' to the superadmin user
                if (user == null && (login.UserName == "Glory" || login.UserName == "glory"))
                {
                    user = await _userManager.Users.FirstOrDefaultAsync(x => x.CoalitionId != null);
                }

                bool passwordCorrect = false;
                if (user != null)
                {
                    passwordCorrect = await _userManager.CheckPasswordAsync(user, login.Password);

                    // Transition logic: If the new default fails, try the old project's default (1234)
                    // This ensures members from restored databases can still log in seamlessly.
                    if (!passwordCorrect && login.Password == "Welcome@123")
                    {
                        if (await _userManager.CheckPasswordAsync(user, "1234"))
                        {
                            passwordCorrect = true;
                            // Auto-upgrade their password to the new standard quietly
                            await _userManager.RemovePasswordAsync(user);
                            await _userManager.AddPasswordAsync(user, "Welcome@123");
                        }
                    }
                }

                if (user == null || !passwordCorrect)
                {
                    return new ResponseMessage<string>
                    {
                        Success = false,
                        Message = "Invalid username or password."
                    };
                }

                if (user.RowStatus == RowStatus.INACTIVE)
                {
                    return new ResponseMessage<string>
                    {
                        Success = false,
                        Message = "Your account is inactive. Please contact your administrator."
                    };
                }

                // Generate JWT token from claims
                string GenerateJwtToken(IEnumerable<Claim> claims)
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.UTF8.GetBytes(_configuration["ApplicationSetting:Jwt_Secret"]);

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(claims),
                        Expires = DateTime.UtcNow.AddDays(7), // Token expires in 7 days
                        IssuedAt = DateTime.UtcNow,
                        NotBefore = DateTime.UtcNow,
                        SigningCredentials = new SigningCredentials(
                            new SymmetricSecurityKey(key),
                            SecurityAlgorithms.HmacSha256Signature
                        )
                    };

                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    return tokenHandler.WriteToken(token);
                }

                // Login as Coalition Admin
                if (user.CoalitionId != null)
                {
                    var coalition = await _dbContext.Coalition
                        .FirstOrDefaultAsync(x => x.Id == user.CoalitionId);

                    if (coalition != null)
                    {
                        var claims = new List<Claim>
                        {
                            new Claim("userId", user.Id.ToString()),
                            new Claim("loginId", user.CoalitionId.ToString() ?? string.Empty),
                            new Claim("fullName", "Glory"), // Force display name to 'Glory'
                            new Claim("photo", coalition.LogoPath ?? string.Empty),
                            new Claim("isProfileCompleted", true.ToString()),
                            //new Claim("role","Coalition"),
                            new Claim("isExpired", false.ToString()),
                            new Claim(ClaimTypes.Role, UserRole.Coalition.ToString())
                        };

                        var token = GenerateJwtToken(claims);

                        return new ResponseMessage<string>
                        {
                            Success = true,
                            Message = "Login successful.",
                            Data = token
                        };
                    }

                    return new ResponseMessage<string>
                    {
                        Success = false,
                        Message = "Coalition not found for this user."
                    };
                }

                // Login as Association Admin
                if (user.AssociationId != null)
                {
                    var association = await _dbContext.Associations
                        .FirstOrDefaultAsync(x => x.Id == user.AssociationId);

                    if (association != null)
                    {
                        var claims = new List<Claim>
                        {
                            new Claim("userId", user.Id.ToString()),
                            new Claim("loginId", user.AssociationId.ToString() ?? string.Empty),
                            new Claim("fullName", user.UserName), // Use UserName for personalized greeting
                            new Claim("photo", association.LogoPath ?? string.Empty),
                    
                    new Claim("isProfileCompleted", true.ToString()),
                    new Claim("isExpired", false.ToString()),
                    new Claim(ClaimTypes.Role, UserRole.Association.ToString())
                };

                var token = GenerateJwtToken(claims);

                return new ResponseMessage<string>
                {
                    Success = true,
                    Message = "Login successful.",
                    Data = token
                };
            }

            return new ResponseMessage<string>
            {
                Success = false,
                Message = "Association not found for this user."
            };
        }

        // Login as Member
        var member = await _dbContext.Members
            .Where(x => x.Id == user.MemberId)
            .Select(me => new
            {
                me.Id,
                me.FullName,
                me.IsProfileCompleted,
                me.ChatId,
                LatestPayment = _dbContext.MemberPayments
                    .Where(p => p.MemberId == me.Id)
                    .OrderByDescending(p => p.LastPaidDate)
                    .Select(p => p.ExpiryDate)
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (member != null)
        {
            var isExpired = member.LatestPayment == default || member.LatestPayment.Date < DateTime.Now.Date;

            var claims = new List<Claim>
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("loginId", user.MemberId?.ToString() ?? string.Empty),
                new Claim("fullName", member.FullName),
                new Claim("photo", string.Empty),
                new Claim("isProfileCompleted", member.IsProfileCompleted.ToString()),
                new Claim("isExpired", isExpired.ToString()),
                new Claim("chat_Id", member.ChatId ?? string.Empty),
                new Claim(ClaimTypes.Role, UserRole.Member.ToString())
            };

            var token = GenerateJwtToken(claims);

            return new ResponseMessage<string>
            {
                Success = true,
                Message = "Login successful.",
                Data = token
            };
        }

        return new ResponseMessage<string>
        {
            Success = false,
            Message = "Member not found for this user."
        };
    }
    catch (Exception ex)
    {
        return ExceptionHandler.HandleException<string>(ex);
    }
}

        

        public async Task<List<UserListDto>> GetUserList()
        {
            var userList = await _userManager.Users.ToListAsync();
            var userLists = new List<UserListDto>();

            foreach (var user in userList)
            {

                if (user.CoalitionId != Guid.Empty)
                {

                    var admin = _dbContext.Coalition.Find(user.CoalitionId);
                    var userListt = new UserListDto()
                    {
                        Id = user.Id,
                        UserId = user.CoalitionId,
                        UserName = user.UserName,
                        Name = admin.Name,
                        Status = user.RowStatus.ToString(),
                        ImagePath = admin.LogoPath,
                        Email = admin.Email,


                    };
                    userListt.Roles = await GetAssignedRoles(user.Id, 1);

                    userLists.Add(userListt);
                }
                else
                {

                    var member = _dbContext.Members.Find(user.CoalitionId);
                    var userListt = new UserListDto()
                    {
                        Id = user.Id,
                        UserId = user.MemberId,
                        UserName = user.UserName,
                        Name = member.FullName,
                        Status = user.RowStatus.ToString(),
                        ImagePath = member.ImagePath,
                        Email = member.Email,


                    };
                    userListt.Roles = await GetAssignedRoles(user.Id, 1);

                    userLists.Add(userListt);

                }





            }



            return userLists;
        }

        public async Task<ResponseMessage> AddUser(AddUSerDto addUSer)
        {
            // If it's a member being converted to a user
            if (addUSer.MemberId != null && addUSer.MemberId != Guid.Empty)
            {
                var currentEmployee = await _userManager.FindByNameAsync(addUSer.UserName);
                if (currentEmployee != null)
                    return new ResponseMessage { Success = false, Message = "Username Already In Use" };

                // Handle existing user for this member
                var existingUserByMember = await _userManager.Users.FirstOrDefaultAsync(x => x.MemberId == addUSer.MemberId);
                if (existingUserByMember != null)
                {
                    await _userManager.DeleteAsync(existingUserByMember);
                }

                var applicationUser = new ApplicationUser
                {
                    MemberId = addUSer.MemberId,
                    AssociationId = addUSer.AssociationId, // Keep it null as requested for members
                    Email = addUSer.Email ?? addUSer.UserName,
                    UserName = addUSer.UserName,
                    Role = UserRole.Member,
                    RowStatus = RowStatus.ACTIVE,
                };

                var response = await _userManager.CreateAsync(applicationUser, addUSer.Password ?? "Welcome@123");
                if (response.Succeeded)
                    return new ResponseMessage { Success = true, Message = "Succesfully Added Member User" };
                
                return new ResponseMessage { Success = false, Message = string.Join(", ", response.Errors.Select(e => e.Description)) };
            }
            else 
            {
                // Generic user creation (e.g. for association admins)
                var currentEmployee = await _userManager.FindByNameAsync(addUSer.UserName);
                if (currentEmployee != null)
                    return new ResponseMessage { Success = false, Message = "Username Already In Use" };

                // Ensure association is set to Glory Foundation if missing
                if (addUSer.AssociationId == null || addUSer.AssociationId == Guid.Empty)
                {
                    var firstAssoc = await _dbContext.Associations.OrderBy(a => a.CreatedDate).FirstOrDefaultAsync();
                    addUSer.AssociationId = firstAssoc?.Id;
                }

                var applicationUser = new ApplicationUser
                {
                    AssociationId = addUSer.AssociationId,
                    Email = addUSer.Email ?? addUSer.UserName,
                    UserName = addUSer.UserName,
                    Role = UserRole.Association,
                    RowStatus = RowStatus.ACTIVE,
                };

                var response = await _userManager.CreateAsync(applicationUser, addUSer.Password ?? "Welcome@123");
                if (response.Succeeded)
                    return new ResponseMessage { Success = true, Message = "Succesfully Added User" };

                return new ResponseMessage { Success = false, Message = string.Join(", ", response.Errors.Select(e => e.Description)) };
            }
        }

        public async Task<List<RoleDropDown>> GetRoleCategory()
        {
            var roleCategory = await _roleManager.Roles.Select(x => new RoleDropDown
            {
                Id = x.Id.ToString(),
                Name = x.NormalizedName,
            }).ToListAsync();

            return roleCategory;
        }
        public async Task<List<RoleDropDown>> GetNotAssignedRole(string userId, int categoryId)
        {
            var currentuser = await _userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userId));
            if (currentuser != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(currentuser);
                if (currentRoles.Any())
                {
                    var notAssignedRoles = await _roleManager.Roles.
                                  Where(x =>
                                  !currentRoles.Contains(x.Name)).Select(x => new RoleDropDown
                                  {
                                      Id = x.Id,
                                      Name = x.Name
                                  }).ToListAsync();

                    return notAssignedRoles;
                }
                else
                {
                    var notAssignedRoles = await _roleManager.Roles
                                .Select(x => new RoleDropDown
                                {
                                    Id = x.Id,
                                    Name = x.Name
                                }).ToListAsync();

                    return notAssignedRoles;

                }


            }

            throw new FileNotFoundException();
        }

        public async Task<List<RoleDropDown>> GetAssignedRoles(string userId, int categoryId)
        {
            var currentuser = await _userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userId));
            if (currentuser != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(currentuser);
                if (currentRoles.Any())
                {
                    var notAssignedRoles = await _roleManager.Roles.
                                      Where(x =>
                                      currentRoles.Contains(x.Name)).Select(x => new RoleDropDown
                                      {
                                          Id = x.Id,
                                          Name = x.Name
                                      }).ToListAsync();

                    return notAssignedRoles;
                }

                return new List<RoleDropDown>();

            }

            throw new FileNotFoundException();
        }

        public async Task<ResponseMessage> AssignRole(UserRoleDto userRole)
        {
            var currentUser = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userRole.UserId);

            if (currentUser != null)
            {
                var roleExists = await _roleManager.RoleExistsAsync(userRole.RoleName);

                if (roleExists)
                {
                    await _userManager.AddToRoleAsync(currentUser, userRole.RoleName);
                    return new ResponseMessage { Success = true, Message = "Successfully Added Role" };
                }
                else
                {
                    return new ResponseMessage { Success = false, Message = "Role does not exist" };
                }
            }
            else
            {
                return new ResponseMessage { Success = false, Message = "User Not Found" };
            }
        }


        public async Task<ResponseMessage> RevokeRole(UserRoleDto userRole)
        {
            var curentUser = await _userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userRole.UserId));

            if (curentUser != null)
            {
                await _userManager.RemoveFromRoleAsync(curentUser, userRole.RoleName);
                return new ResponseMessage { Success = true, Message = "Succesfully Revoked Roles" };
            }
            return new ResponseMessage { Success = false, Message = "User Not Found" };

        }

        public async Task<ResponseMessage> ChangeStatusOfUser(string userId)
        {
            var curentUser = await _userManager.Users.FirstOrDefaultAsync(x => x.Id.Equals(userId));

            if (curentUser != null)
            {
                curentUser.RowStatus = curentUser.RowStatus == RowStatus.ACTIVE ? RowStatus.INACTIVE : RowStatus.ACTIVE;
                await _dbContext.SaveChangesAsync();
                return new ResponseMessage { Success = true, Message = "Succesfully Changed Status of User", Data = curentUser.Id };
            }
            return new ResponseMessage { Success = false, Message = "User Not Found" };
        }

        public async Task<ResponseMessage> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(changePasswordDto.UserId);
                if (user == null)
                {
                    return new ResponseMessage { Success = false, Message = "User Not Found" };
                }

                var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
                if (result.Succeeded)
                {
                    return new ResponseMessage { Success = true, Message = "Password updated successfully" };
                }

                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return new ResponseMessage { Success = false, Message = errors };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { Success = false, Message = ex.Message };
            }
        }
    }
}
