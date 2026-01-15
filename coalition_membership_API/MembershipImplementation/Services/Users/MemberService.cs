using AutoMapper;
using AutoMapper.Execution;
using AutoMapper.QueryableExtensions;
using Implementation.DTOS.Authentication;
using Implementation.Helper;
using Implementation.Interfaces.Authentication;
using Microsoft.Extensions.Configuration;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.DTOS.HRM;
using MembershipImplementation.Helper;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Interfaces.HRM;
using MembershipImplementation.Services.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using MembershipInfrustructure.Model.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Reporting.NETCore;
using Microsoft.VisualBasic;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using OfficeOpenXml;
using System.Text.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Numerics;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using MembershipImplementation.DTOS.Users;
using static MembershipInfrustructure.Data.EnumList;
using Member = MembershipInfrustructure.Model.Users.Member;
using MemberPaymentDto = MembershipImplementation.DTOS.Payment.MemberPaymentDto;

namespace MembershipImplementation.Services.HRM
{
    public class MemberService : IMemberService
    {

        private readonly ApplicationDbContext _dbContext;
        private readonly IGeneralConfigService _generalConfig;
        private UserManager<ApplicationUser> _userManager;
        private readonly IAuthenticationService _authenticationService;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        public MemberService(ApplicationDbContext dbContext,
            UserManager<ApplicationUser> userManager,
            IAuthenticationService authenticationService,
            IEmailService emailService,
            IHttpClientFactory httpClientFactory,
            IGeneralConfigService generalConfig, IMapper mapper,
            IConfiguration configuration)
        {
            _dbContext = dbContext;
            _generalConfig = generalConfig;
            _userManager = userManager;
            _mapper = mapper;
            _authenticationService = authenticationService;
            _emailService = emailService;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<ResponseMessage<MembersGetDto>> RegisterMember(MembersPostDto memberPost)
        {
            try
            {
                Member members = new Member
                {
                    Id = Guid.NewGuid(),
                    FullName = $"{memberPost.FirstName} {memberPost.LastName}",
                    PhoneNumber = memberPost.PhoneNumber,
                    Email = memberPost.Email!=""?memberPost.Email:$"{memberPost.FirstName}_abizeerfamil@gmail.com",
                    Zone = memberPost.Zone,
                    MembershipTypeId = memberPost.MembershipTypeId,
                    BirthDate = DateTime.Now,
                    Woreda = memberPost.Woreda,
                    RowStatus = RowStatus.ACTIVE,
                    CreatedDate = DateTime.Now,
                };
                members.CreatedById = members.Id.ToString();
                if (memberPost.RegionId.Length== 36)
                {
                    members.RegionId = Guid.Parse(memberPost.RegionId);
                }
                else
                {
                    
                    var regionalready = await _dbContext.Regions.Where((x)=>x.RegionName==memberPost.RegionId).FirstOrDefaultAsync();

                    if (regionalready != null)
                    {
                        members.RegionId = regionalready.Id;
                    }
                    else
                    {
                        var region = new Region()
                        {
                            Id = Guid.NewGuid(),
                            RegionName = memberPost.RegionId,
                            CountryType = CountryType.FOREIGN,
                            CreatedDate = DateTime.Now,
                            CreatedById = "7cd878f5-8d25-494d-899c-a9d46ebf12c9"

                        };
                        await _dbContext.Regions.AddAsync(region);
                        await _dbContext.SaveChangesAsync();
                        members.RegionId = region.Id;
                    }
                    
                }

                var memberType = await _dbContext.MembershipTypes.FindAsync(memberPost.MembershipTypeId);


                await _dbContext.Members.AddAsync(members);
                await _dbContext.SaveChangesAsync();


                return new ResponseMessage<MembersGetDto>
                {
                    Success = true,
                    Data = new MembersGetDto
                    {
                        Id = members.Id.ToString(),
                        FullName = members.FullName,
                        PhoneNumber = members.PhoneNumber,
                        Email = members.Email,
                        MembershipTypeId = memberPost.MembershipTypeId.ToString(),
                        Woreda = memberPost.Woreda,
                        Amount = memberType.Money,
                        Currency = memberType.Currency.ToString(),
                        MembershipTypeName = memberType.Name
                    },
                    Message = "Added Successfully",
                 
                };
            }
            catch (Exception ex)
            {
                return ExceptionHandler.HandleException<MembersGetDto>(ex);
            }
        }

        public async Task<ResponseMessage> RegisterMemberFromBot(MembersPostDto memberPost)
        {
            try
            {
                Member members = new Member
                {
                    Id = Guid.NewGuid(),
                    FullName = $"{memberPost.FirstName} {memberPost.LastName}",
                    PhoneNumber = memberPost.PhoneNumber,
                    Email = memberPost.Email,
                    //RegionId = memberPost.RegionId,
                    Zone = memberPost.Zone,
                    MembershipTypeId = memberPost.MembershipTypeId,
                    Woreda = memberPost.Woreda,
                    RowStatus = RowStatus.ACTIVE,
                    CreatedDate = DateTime.Now,
                    
                };

                var memberType = await _dbContext.MembershipTypes.FindAsync(memberPost.MembershipTypeId);


                await _dbContext.Members.AddAsync(members);
                await _dbContext.SaveChangesAsync();


                return new ResponseMessage
                {
                    Data = new MembersGetDto
                    {
                        Id = members.Id.ToString(),
                        FullName = members.FullName,
                        PhoneNumber = members.PhoneNumber,
                        Email = members.Email,

                        MembershipTypeId = memberPost.MembershipTypeId.ToString(),
                        Woreda = memberPost.Woreda,
                    
                        Amount = memberType.Money,


                    },
                    Message = "Added Successfully",
                    Success = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseMessage
                {

                    Message = ex.Message,
                    Success = false
                };
            }
        }


        public async Task<MembersGetDto> CheckPhoneNumberExist(string PhoneNumber)
        {
            var members = await _dbContext.Members.Where(x => x.PhoneNumber == PhoneNumber).Select(x =>
                 new MembersGetDto
                 {
                     Id = x.Id.ToString(),
                     FullName = x.FullName,
                     PhoneNumber = x.PhoneNumber,
                     Email = x.Email,
                     Zone = x.Zone,
                     Woreda = x.Woreda,


                 }).FirstOrDefaultAsync();
            return members;
        }

        public async Task<List<MembersGetDto>> GetMembers(Guid? associationId)
        {
            var encryption = "2B7E151628AED2A6ABF7158809CF4F3C";

            // Fetch members with related data
            var members = await _dbContext.Members
                .AsNoTracking()
                .Select(m => new
                {
                    m.Id,
                    m.FullName,
                    m.PhoneNumber,
                    m.RegionId,
                    m.ImagePath,
                    m.Email,
                    m.Zone,
                    RegionName = m.Region.RegionName,
                    m.Woreda,

                    m.MembershipType,
                    m.MembershipTypeId,
                    MembershipTypeName = m.MembershipType.Name,
                    MembershipTypeCategory = m.MembershipType.Category,
                    MembershipTypeCounter = m.MembershipType.Counter,
                    m.MemberId,
                    m.Gender,

                    m.BirthDate,
                    

                    m.CreatedDate
                })
                .ToListAsync();

            if (associationId.HasValue && associationId != Guid.Empty)
            {
                members = members.Where(x => x.MembershipType.AssociationId == associationId).ToList();
            }

            // Fetch all payments for each member
            var allMemberPayments = await _dbContext.MemberPayments
                .AsNoTracking()
                .GroupBy(p => p.MemberId)
                .Select(g => new
                {
                    MemberId = g.Key,
                    Payments = g.OrderByDescending(p => p.LastPaidDate)
                        .Select(p => new
                        {
                            p.Amount,
                            p.TransactionReference,
                            p.ExpiryDate,
                            p.PaymentStatus,
                            p.LastPaidDate
                        })
                        .ToList()
                })
                .ToDictionaryAsync(x => x.MemberId);

            // Combine the data in memory
            return members.Select(m =>
            {
                allMemberPayments.TryGetValue(m.Id, out var memberPayments);
                var payments = memberPayments?.Payments;
                var latestPayment = payments?.FirstOrDefault();
                var secondLatestPayment = payments?.Skip(1).FirstOrDefault();
                var paymentCount = payments?.Count ?? 0;
                var memberStatus = DetermineMemberStatus(paymentCount, latestPayment?.PaymentStatus, secondLatestPayment?.PaymentStatus);

                var expiryDate = latestPayment?.ExpiryDate;
                if (expiryDate == null || expiryDate == DateTime.MinValue)
                {
                    var mtCategory = m.MembershipTypeCategory;
                    var mtCounter = m.MembershipTypeCounter > 0 ? m.MembershipTypeCounter : 1;
                    
                    expiryDate = mtCategory == MemberShipTypeCategory.MONTHLY ?
                                 m.CreatedDate.AddMonths(mtCounter) :
                                 m.CreatedDate.AddYears(mtCounter);
                }

                return new MembersGetDto
                {
                    Id = m.Id.ToString(),
                    FullName = m.FullName,
                    PhoneNumber = m.PhoneNumber,
                    RegionId = m.RegionId.ToString(),
                    ImagePath = m.ImagePath,
                    Email = m.Email,
                    Zone = m.Zone,
                    Region = m.RegionName,
                    Woreda = m.Woreda,

                    MembershipTypeId = m.MembershipTypeId.ToString(),
                    MembershipType = m.MembershipTypeName,
                    MemberId = m.MemberId,
                    Gender = m.Gender.ToString(),
                    Amount = latestPayment?.Amount ?? 0.0,
                    Text_Rn = latestPayment?.TransactionReference ?? "",
                    ExpiredDate = (DateTime)expiryDate,

                    BirthDate = m.BirthDate,
                    
                    MembershipCategory = m.MembershipType.Category.ToString(),

                    AssociationId = m.MembershipType.AssociationId.ToString(),

                    PaymentStatus = latestPayment?.PaymentStatus.ToString() ?? PaymentStatus.PENDING.ToString(),
             
                    LastPaid = latestPayment?.LastPaidDate ?? m.CreatedDate,

                    createdByDate = m.CreatedDate,
                    MemberStatus = memberStatus
                };
            }).ToList();
        }

        // Helper method to determine member status
        private string DetermineMemberStatus(int paymentCount, PaymentStatus? latestPaymentStatus, PaymentStatus? secondLatestPaymentStatus)
        {

            if (latestPaymentStatus == PaymentStatus.EXPIRED)
            {
                return "Waiting for Renewal";
            }

            else if (secondLatestPaymentStatus == PaymentStatus.EXPIRED)
            {
                if (latestPaymentStatus == PaymentStatus.PAID)
                {
                    return "Renewed Member";
                }
                else if (latestPaymentStatus == PaymentStatus.PENDING)
                {
                    return "Waiting for Renewal";
                }
                else
                {
                    return "Waiting for Renewal";
                }

            }



            else
            {
                return "New Member";
            }


        }
        public async Task<MembersGetDto> GetSingleMember(Guid MemberId)
        {
            var encryption = "2B7E151628AED2A6ABF7158809CF4F3C";
            var members = await (from member in _dbContext.Members.Where(x => x.Id == MemberId)
                                 join payment in _dbContext.MemberPayments on member.Id equals payment.MemberId into memberPayments
                                 let latestPayment = memberPayments.OrderByDescending(x => x.LastPaidDate).FirstOrDefault()
                                 select new MembersGetDto
                                 {
                                     Id = member.Id.ToString(),
                                     FullName = member.FullName,
                                     PhoneNumber = member.PhoneNumber,
                                     ImagePath = member.ImagePath,
                                     Email = member.Email,
                                     Zone = member.Zone,
                                     Region = member.Region.RegionName,
                                     Woreda = member.Woreda,
                                     Gender = member.Gender.ToString(),

                                     MembershipTypeId = member.MembershipTypeId.ToString(),
                                     MembershipType = member.MembershipType.Name,
                                     MemberId = member.MemberId,
                                     AssociationId = member.MembershipType.AssociationId.ToString(),
                                     MembershipCategory = member.MembershipType.Category.ToString(),

                                     BirthDate = member.BirthDate,

                               
                                     ExpiredDate = latestPayment != null ? latestPayment.ExpiryDate : 
                                                   (member.MembershipType.Category == MemberShipTypeCategory.MONTHLY ? 
                                                    member.CreatedDate.AddMonths(member.MembershipType.Counter > 0 ? member.MembershipType.Counter : 1) : 
                                                    member.CreatedDate.AddYears(member.MembershipType.Counter > 0 ? member.MembershipType.Counter : 1)),
                                     PaymentStatus = latestPayment != null ? latestPayment.PaymentStatus.ToString() : "PENDING",
                                     LastPaid = latestPayment != null ? latestPayment.LastPaidDate : member.CreatedDate,
                                     Text_Rn = latestPayment != null ? latestPayment.TransactionReference : "",
                                     Amount = member.MembershipType.Money,
                                     IsBirthDate = member.IsBirthDateToday,


                                     createdByDate = member.CreatedDate,
                                     Currency = member.MembershipType.Currency.ToString()



                                 }).FirstOrDefaultAsync();




            return members;

        }

        public async Task<MemberPayment> GetSingleMemberPayment(Guid MemberId)
        {
            var memberPayment = await _dbContext.MemberPayments.Where(x => x.MemberId == MemberId).FirstOrDefaultAsync();

            return memberPayment;
        }

        public async Task<ResponseMessage> CompleteProfile(CompleteProfileDto Profile)
        {

            var currentMember = await _dbContext.Members.FirstOrDefaultAsync(x => x.Id == Profile.Id);
            var imagePath = "";

            if (currentMember != null)
            {

                if (!string.IsNullOrEmpty(Profile.Gender) && Enum.TryParse<Gender>(Profile.Gender, true, out var gender))
                    currentMember.Gender = gender;
                    
                currentMember.IsProfileCompleted = true;
                if (Profile.BirthDate.HasValue)
                    currentMember.BirthDate = Profile.BirthDate.Value;
                if (Profile.Image != null)
                {
                    imagePath = await _generalConfig.UploadFiles(Profile.Image, currentMember.FullName, "Member");
                    currentMember.ImagePath = imagePath;
                }

                await _dbContext.SaveChangesAsync();
                return new ResponseMessage { Data = currentMember, Success = true, Message = "Profile Completed Successfully" };
            }
            return new ResponseMessage { Success = false, Message = "Unable To Find Member" };


        }

        public async Task<ResponseMessage> MakePayment(MemberPaymentDto memberPayment)
        {
            try
            {
                var membershipType = await _dbContext.MembershipTypes.FindAsync(memberPayment.MembershipTypeId);
            
            
                var mtCounter = membershipType.Counter > 0 ? membershipType.Counter : 1;
                MemberPayment members = new MemberPayment
                {
                    Id = Guid.NewGuid(),
                    MemberId = memberPayment.MemberId,
                    PaymentUrl = memberPayment.Url,
                    MembershipTypeId = memberPayment.MembershipTypeId,
                    ExpiryDate = 
                        membershipType.Category == MemberShipTypeCategory.MONTHLY?
                            DateTime.Now.AddMonths(mtCounter): DateTime.Now.AddYears(mtCounter),
                        
                    LastPaidDate = DateTime.Now,
                    TransactionReference = memberPayment.Text_Rn,
                    Amount = memberPayment.Payment,
                    PaymentStatus = PaymentStatus.PENDING
                };
                var memeber = await _dbContext.Members.FindAsync(memberPayment.MemberId);

                memeber.MembershipTypeId = memberPayment.MembershipTypeId;
                await _dbContext.SaveChangesAsync();


                await _dbContext.MemberPayments.AddAsync(members);
                await _dbContext.SaveChangesAsync();
                
                var memberPaymentDto = new MemberPayment2Dto
                {
                    TransactionReference = members.TransactionReference,
                    PaymentUrl = members.PaymentUrl,
                    Amount = members.Amount,
                    ExpiryDate = members.ExpiryDate,
                    LastPaidDate = members.LastPaidDate,
                    PaymentStatus = members.PaymentStatus.ToString()
                };
                
                
                
                
                return new ResponseMessage
                {
                    Data = memberPaymentDto,
                    Message = "Added Successfully",
                    Success = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseMessage()
                {
                    Success = false,
                    Message = ex.Message,
                };
            }
           
        }

        public async Task<ResponseMessage> MakePaymentConfirmation(string txt_rn)
        {
            var currentPayment = await _dbContext.MemberPayments
                .Include(x => x.Member)
                    .ThenInclude(m => m.MembershipType)
                        .ThenInclude(mt => mt.Association)
                .Where(x => x.MemberId == Guid.Parse(txt_rn))
                .OrderByDescending(x=>x.CreatedDate)
                .FirstOrDefaultAsync();

            // Verify payment with ArifPay before processing
            if (currentPayment != null && !string.IsNullOrEmpty(currentPayment.TransactionReference))
            {
                var apiKey = currentPayment.Member?.MembershipType?.Association?.ArifPayKey ?? string.Empty;
                var paymentServiceUrl = _configuration["PaymentServiceUrl"] ?? "https://eplffc.et/payment";
                var baseUrl = paymentServiceUrl.TrimEnd('/');
                
                var endpoint = string.IsNullOrWhiteSpace(apiKey)
                    ? $"{baseUrl}/verify-payment/{currentPayment.TransactionReference}"
                    : $"{baseUrl}/arifpay/verify-payment/{currentPayment.TransactionReference}?apikey={Uri.EscapeDataString(apiKey)}";
                
                try
                {
                    var httpClient = _httpClientFactory.CreateClient();
                    var response = await httpClient.GetAsync(endpoint);
                    var content = await response.Content.ReadAsStringAsync();
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var verificationData = JsonSerializer.Deserialize<JsonElement>(content);
                        if (verificationData.TryGetProperty("response", out var responseData))
                        {
                            if (responseData.TryGetProperty("data", out var dataElement))
                            {
                                var transactionStatus = dataElement.TryGetProperty("transactionStatus", out var statusElement) 
                                    ? statusElement.GetString() 
                                    : string.Empty;
                                
                                // Only proceed if status is SUCCESS
                                if (transactionStatus?.ToUpper() != "SUCCESS")
                                {
                                    return new ResponseMessage 
                                    { 
                                        Success = false, 
                                        Message = $"Payment verification failed. Status: {transactionStatus}" 
                                    };
                                }
                            }
                        }
                    }
                    else
                    {
                        return new ResponseMessage 
                        { 
                            Success = false, 
                            Message = $"Unable to verify payment with ArifPay. Status: {response.StatusCode}" 
                        };
                    }
                }
                catch (Exception ex)
                {
                    return new ResponseMessage 
                    { 
                        Success = false, 
                        Message = $"Error verifying payment: {ex.Message}" 
                    };
                }
            }

            var member = currentPayment?.Member;
            var memberType = await _dbContext.MembershipTypes.FindAsync(member.MembershipTypeId);
            if (member != null && memberType != null && (member.MemberId == null || member.MemberId == ""))
            {
                // Use consecutive member ID generation based on association
                var memberID = await _generalConfig.GenerateConsecutiveMemberId(0, memberType.ShortCode, memberType.AssociationId);
                
                if (string.IsNullOrEmpty(memberID))
                {
                    // Fallback to random generation if no GeneralCode found for this association
                    memberID = await _generalConfig.GenerateCode(0, memberType.ShortCode);
                    while (_dbContext.Members.Any(x => x.MemberId == memberID))
                    {
                        memberID = await _generalConfig.GenerateCode(0, memberType.ShortCode);
                    }
                }
                
                member.MemberId = memberID;
                await _dbContext.SaveChangesAsync();
                AddUSerDto addUser = new AddUSerDto
                {

                    MemberId = member.Id,
                    UserName = member.MemberId,
                    Password = "1234",

                };
                var result = await _authenticationService.AddUser(addUser);

                var message = $"Congratulations {member.FullName}, on becoming a Glory Foundation Member!!!\n" +
                    $"We have received your payment and would like to thank you for \n being a member of Glory Foundation. \n" +
                    $"Your Membership ID is {member.MemberId}. You can log in through https://gloryfoundation.et/admin/auth/membership-login/{member.MemberId} using the provided membership Id. ";
             
                var email = new EmailMetadata
                                    (member.Email, "ID Card Status",
                                        $"{message}" +
                                        $"\nThank you.\n\nSincerely,\n\nExecutive Director");
                await _emailService.Send(email);
                
                var messageReques = new MessageRequest
                {
                    PhoneNumber = member.PhoneNumber,
                    Message = message
                };
                await _generalConfig.SendMessage(messageReques);

            }
            if (currentPayment != null)
            {


                if (currentPayment.PaymentStatus != PaymentStatus.PAID && !currentPayment.IsPaid)
                {
                    currentPayment.PaymentStatus = PaymentStatus.PAID;
                    currentPayment.IsPaid = true;

                    await _dbContext.SaveChangesAsync();

                    // Send SMS for successful payment (both new and renewal)
                    if (member.MemberId != null && member.MemberId != "")
                    {
                        var payments = await _dbContext.MemberPayments.AnyAsync(x =>
                            x.MemberId == member.Id && x.PaymentStatus == PaymentStatus.EXPIRED);

                        if (payments)
                        {
                            // Renewal message
                            var message = $"Congratulations {member.FullName}, your Glory Foundation Membership has been successfully renewed!\n" +
                                          $"We have received your payment and would like to thank you for continuing to be a valued member of the Glory Foundation.\n" +
                                          $"Your renewed Membership ID is {member.MemberId}, valid until {currentPayment.ExpiryDate.ToString("MMMM dd, yyyy")}. You can log in through https://gloryfoundation.et using your Membership ID.";

                            var messageReques = new MessageRequest
                            {
                                PhoneNumber = member.PhoneNumber,
                                Message = message
                            };
                            await _generalConfig.SendMessage(messageReques);
                        }
                        // New members already received SMS in the previous block (lines 622-627), so we skip sending here to avoid duplicate messages
                    }
                }
                
                
                var dto = new MemberDto
                {
                    Id = member.Id,
                    FullName = member.FullName,
                    PhoneNumber = member.PhoneNumber,
                    Email = member.Email,
                    memberId = member.MemberId,
                    MembershipTypeName = memberType.Name,
                    ExpiryDate = currentPayment.ExpiryDate
                };

                return new ResponseMessage { Success = true, Message = "Payment Completed Successfully", Data = dto };
            }
            return new ResponseMessage { Success = false, Message = "Unable To Find Payment Refernece" };

        }

        public async Task<ResponseMessage> UpdateProfile(MemberUpdateDto memberUpdate)
        {

            var currentMember = await _dbContext.Members.FirstOrDefaultAsync(x => x.Id == memberUpdate.Id);

            if (currentMember != null)
            {
                if (!string.IsNullOrEmpty(memberUpdate.Gender) && Enum.TryParse<Gender>(memberUpdate.Gender, true, out var gender))
                    currentMember.Gender = gender;

                if (memberUpdate.BirthDate.HasValue)
                    currentMember.BirthDate = memberUpdate.BirthDate.Value;
                currentMember.Woreda = memberUpdate.Woreda;

                currentMember.Email = memberUpdate.Email;

                if (memberUpdate.Image != null)
                {
                    var imagePath = await _generalConfig.UploadFiles(memberUpdate.Image, currentMember.FullName, "Member");
                    currentMember.ImagePath = imagePath;
                }


                await _dbContext.SaveChangesAsync();
                return new ResponseMessage { Data = currentMember, Success = true, Message = "Updated Successfully" };
            }
            return new ResponseMessage { Success = false, Message = "Unable To Find Member" };
        }


        public async Task<ResponseMessage> UpdateProfileFromAdmin(MemberUpdateDto memberUpdate)
{
    try
    {
        var currentMember = await _dbContext.Members
            .Include(x => x.MembershipType)
            .FirstOrDefaultAsync(x => x.Id == memberUpdate.Id);

        if (currentMember == null)
            return new ResponseMessage { Success = false, Message = "Unable To Find Member" };

        // Update basic fields
        currentMember.FullName = memberUpdate.FullName;
        currentMember.PhoneNumber = memberUpdate.PhoneNumber;
        currentMember.Email = memberUpdate.Email;
        if (!string.IsNullOrEmpty(memberUpdate.Gender))
        {
            if (Enum.TryParse<Gender>(memberUpdate.Gender, true, out var gender))
                currentMember.Gender = gender;
        }
        
        if (memberUpdate.BirthDate.HasValue)
            currentMember.BirthDate = memberUpdate.BirthDate.Value;
        currentMember.Woreda = memberUpdate.Woreda;

        if (!string.IsNullOrEmpty(memberUpdate.RegionId) && Guid.TryParse(memberUpdate.RegionId, out var regionId))
            currentMember.RegionId = regionId;

        bool isMembershipTypeChanged = memberUpdate.MembershipTypeId != null &&
                                       currentMember.MembershipTypeId != memberUpdate.MembershipTypeId;

        if (memberUpdate.MembershipTypeId.HasValue)
            currentMember.MembershipTypeId = memberUpdate.MembershipTypeId.Value;

        // Upload new profile image if provided
        if (memberUpdate.Image != null)
        {
            try
            {
                currentMember.ImagePath = await _generalConfig.UploadFiles(memberUpdate.Image, currentMember.FullName, "Member");
            }
            catch (Exception ex)
            {
                // Log and continue or return error if image is mandatory
                return new ResponseMessage { Success = false, Message = $"Image upload failed: {ex.Message}" };
            }
        }

        // Process member payments
        var currentPayments = await _dbContext.MemberPayments
            .Where(x => x.MemberId == currentMember.Id)
            .OrderBy(x => x.LastPaidDate)
            .ToListAsync();

        var currentPayment = currentPayments.FirstOrDefault() ?? new MemberPayment
        {
            Id = Guid.NewGuid(),
            MemberId = currentMember.Id,
            MembershipTypeId = currentMember.MembershipTypeId,
            TransactionReference = "tx-coalition-admin_register",
            PaymentUrl = ""
        };

        if (!string.IsNullOrEmpty(memberUpdate.PaymentStatus))
        {
            if (Enum.TryParse<PaymentStatus>(memberUpdate.PaymentStatus, true, out var status))
                currentPayment.PaymentStatus = status;
        }

        if (memberUpdate.LastPaid.HasValue)
        {
            currentPayment.LastPaidDate = memberUpdate.LastPaid.Value;
        }

        // Handle Expiry Date calculation or update
        if (memberUpdate.ExpiredDate.HasValue && (!memberUpdate.LastPaid.HasValue || memberUpdate.ExpiredDate > memberUpdate.LastPaid))
        {
            currentPayment.ExpiryDate = memberUpdate.ExpiredDate.Value;
        }
        else if (memberUpdate.LastPaid.HasValue)
        {
            // Calculate expiry based on LastPaid and MembershipType
            var mt = currentMember.MembershipType ?? await _dbContext.MembershipTypes.FindAsync(currentMember.MembershipTypeId);
            if (mt != null)
            {
                var mtCounter = mt.Counter > 0 ? mt.Counter : 1;
                currentPayment.ExpiryDate = mt.Category == MemberShipTypeCategory.MONTHLY ?
                                            memberUpdate.LastPaid.Value.AddMonths(mtCounter) :
                                            memberUpdate.LastPaid.Value.AddYears(mtCounter);
            }
            else
            {
                // Fallback if membership type is missing
                currentPayment.ExpiryDate = memberUpdate.LastPaid.Value.AddYears(1);
            }
        }
        currentPayment.CreatedById = currentMember.Id.ToString();
        currentMember.CreatedDate = DateTime.Now;
        
        if (currentPayment.PaymentStatus == PaymentStatus.PAID)
        {
            await HandlePaidMembership(currentMember, currentPayment, isMembershipTypeChanged);
        }

        if (!currentPayments.Contains(currentPayment))
            await _dbContext.MemberPayments.AddAsync(currentPayment);

        await _dbContext.SaveChangesAsync();
        return new ResponseMessage { Data = new { currentMember.Id, currentMember.FullName, currentMember.MemberId }, Success = true, Message = "Member profile updated successfully!" };
    }
    catch (Exception ex)
    {
        return new ResponseMessage { Success = false, Message = ex.Message };
    }
}

private async Task HandlePaidMembership(Member currentMember, MemberPayment currentPayment, bool isMembershipTypeChanged)
{
    var mt = await _dbContext.MembershipTypes.FindAsync(currentMember.MembershipTypeId);
    if (mt == null) throw new Exception("Membership type not found for the member.");
    currentPayment.IsPaid = true;

    if (string.IsNullOrEmpty(currentMember.MemberId) || isMembershipTypeChanged)
    {
        var memberID = await GenerateUniqueMemberID(mt.ShortCode, mt.AssociationId);
        currentMember.MemberId = memberID;

        if (isMembershipTypeChanged)
        {
            var memberUsers = await _dbContext.Users.Where(x => x.Role==UserRole.Member && x.MemberId == currentMember.Id).ToListAsync();
            _dbContext.Users.RemoveRange(memberUsers);
            await _dbContext.SaveChangesAsync();
        }

        await CreateAndNotifyUser(currentMember, memberID);
    }
}

private async Task<string> GenerateUniqueMemberID(string shortCode, Guid associationId)
{
    // Try consecutive generation first
    var memberID = await _generalConfig.GenerateConsecutiveMemberId(0, shortCode, associationId);
    
    if (string.IsNullOrEmpty(memberID))
    {
        // Fallback to random generation if no GeneralCode found for this association
        do
        {
            memberID = await _generalConfig.GenerateCode(0, shortCode);
        } while (_dbContext.Members.Any(x => x.MemberId == memberID));
    }

    return memberID;
}

private async Task CreateAndNotifyUser(Member member, string memberID)
{
    AddUSerDto addUser = new AddUSerDto
    {
        MemberId = member.Id,
        UserName = memberID,
        Password = "1234"
    };
    await _authenticationService.AddUser(addUser);

    var message = $"Congratulations {member.FullName} on becoming an EPLFFC Member! \n" +
                  $"We have received your payment, thank you for being a part of the EPLFFC  Association. \n" +
                  $"Your Membership ID is {memberID}. You can log in at https://eplffc.et with this ID.";

    await _generalConfig.SendMessage(new MessageRequest
    {
        PhoneNumber = member.PhoneNumber,
        Message = message
    });

    var email = new EmailMetadata(member.Email, "ID Card Status",
        $"{message}\nThank you.\n\nSincerely,\nFekadu Mazengia\nExecutive Director");
    await _emailService.Send(email);
}

       


        public async Task<ResponseMessage2> CheckIfPhoneNumberExistFromBot(string phoneNumber)
        {




            var members = await _dbContext.Members.Include(x => x.MembershipType).Where(x => x.PhoneNumber == phoneNumber).FirstOrDefaultAsync();

            if (members == null)
            {
                return new ResponseMessage2
                {
                    Exist = false,

                };
            }
            else
            {
                var memberPayment = await _dbContext.MemberPayments.Where(x => x.MemberId == members.Id)
                                            .OrderByDescending(x => x.LastPaidDate).FirstOrDefaultAsync();


                if (memberPayment == null)
                {

                    MemberTelegramDto member = new MemberTelegramDto
                    {
                        FullName = members.FullName,
                        PhoneNumber = members.PhoneNumber,
                        Amount = members.MembershipType.Money,
                        Currency = members.MembershipType.Currency.ToString(),
                        MembershipType = members.MembershipType.Name,
                        MembershipTypeId = members.MembershipTypeId.ToString(),
                        Text_Rn = null,
                        Email = members.Email,
                        PaymentStatus = null,
                        Url = null,
                        MemberId = members.MemberId,
                        Id = members.Id,


                    };
                    return new ResponseMessage2
                    {
                        Exist = true,
                        Status = "PENDING",
                        Message = $"Membership Type is {members.MembershipType.Name.ToUpper()}, and the Price is {members.MembershipType.Money} ETB. Please Complete the payment!!!",
                        Member = member

                    };

                }
                else
                {

                    MemberTelegramDto member = new MemberTelegramDto
                    {
                        FullName = members.FullName,
                        PhoneNumber = members.PhoneNumber,
                        Currency = members.MembershipType.Currency.ToString(),
                        Email = members.Email,
                        Amount = members.MembershipType.Money,
                        MembershipType = members.MembershipType.Name,
                        MembershipTypeId = members.MembershipTypeId.ToString(),
                        Text_Rn = memberPayment.TransactionReference,
                        PaymentStatus = memberPayment.PaymentStatus.ToString(),
                        ExpiredDate = memberPayment.ExpiryDate,
                        MemberId = members.MemberId,
                        Url = memberPayment.PaymentUrl,
                        Id = members.Id,


                    };
                    var todayDate = DateTime.Now;
                    var isExpired = memberPayment.ExpiryDate.Date < todayDate.Date;

                    if (isExpired)
                    {
                        return new ResponseMessage2
                        {
                            Exist = true,
                            Status = PaymentStatus.EXPIRED.ToString(),
                            Message = $"Expired on {memberPayment.ExpiryDate}",
                            Member = member

                        };
                    }

                    if (memberPayment.PaymentStatus == PaymentStatus.PAID)
                    {
                        return new ResponseMessage2
                        {
                            Exist = true,
                            Status = PaymentStatus.PAID.ToString(),
                            Message = $"Will Expired on {memberPayment.ExpiryDate}",
                            Member = member

                        };

                    }

                    return new ResponseMessage2
                    {
                        Exist = true,
                        Status = PaymentStatus.PENDING.ToString(),
                        Message = $"Membership Type is {members.MembershipType.Name.ToUpper()}, and the Price is {members.MembershipType.Money} ETB. Please Complete the payment!!!",
                        Member = member

                    };


                }
            }
        }

        public async Task UPdateExpiredDateStatus()
        {
            var todayDate = DateTime.Now;
            var tenDaysFromNow = todayDate.AddDays(10);



            var memberPayments = await _dbContext.MemberPayments.Include(x => x.Member).Where(x => x.ExpiryDate < todayDate.Date && x.PaymentStatus != PaymentStatus.EXPIRED).ToListAsync();

            var memberPayments10days = await _dbContext.MemberPayments.Include(x => x.Member)
    .Where(x => x.ExpiryDate <= tenDaysFromNow && x.PaymentStatus != PaymentStatus.EXPIRED)
    .ToListAsync();

            foreach (var payment in memberPayments)
            {
                payment.PaymentStatus = PaymentStatus.EXPIRED;
                _dbContext.SaveChangesAsync();



                var message = $"Dear Glory Foundation Member {payment.Member.FullName},\n\n" +
                  $"We would like to inform you that your membership with the Glory Foundation will expire on {payment.ExpiryDate.ToString("MMMM dd, yyyy")}.\n\n" +
                  $"Please renew your membership by visiting https://gloryfoundation.et and using your Membership ID: {payment.Member.MemberId}.";



                var messageReques = new MessageRequest
                {
                    PhoneNumber = payment.Member.PhoneNumber,
                    Message = message
                };
                await _generalConfig.SendMessage(messageReques);



            }

            foreach (var payment in memberPayments10days)
            {

                var message = $"Membership Expiration Warning!!!\n" +
                              $"{payment.Member.FullName}" +
                    $"This is a kindly reminder your Membership will expired on {payment.ExpiryDate}. \n" +
                    $"Your Membership ID is {payment.Member.MemberId} you can login through https://eplffc.et and extend your membership .";
                var email = new EmailMetadata
                                    (payment.Member.Email, "Membership Status",
                                        $"{message}" +
                                        $"\nThank you.\n\nSincerely,\nFekadu Mazengia\nExecutive Director");
                await _emailService.Send(email);

            }





        }




        public async Task UpdateBirthDate()
        {
            var todayDate = DateTime.Now;

            var members = await _dbContext.Members.ToListAsync();

            foreach (var member in members)
            {
                if (member.BirthDate.Date == todayDate.Date)
                {
                    member.IsBirthDateToday = true;

                    var message = $"EPLFFC Wishes You a Happy Birth Day";
                    var email = new EmailMetadata
                                        (member.Email, "Happy BirthDay",
                                            $"Dear {member.FullName},\n\n{message}." +
                                            $"\nThank you.\n\nSincerely,\nEMIA");
                    await _emailService.Send(email);
                }
                else
                {
                    member.IsBirthDateToday = false;
                }
                _dbContext.SaveChangesAsync();
            }

        }


        public async Task<List<MemberRegionRevenueReportDto>> GetRegionRevenueReport()
        {
            var chapters = await _dbContext.Regions.Where(x => x.CountryType == CountryType.ETHIOPIAN).ToListAsync();

            var memberPayments = await _dbContext.MemberPayments.Include(x => x.Member).ThenInclude(x => x.MembershipType).ThenInclude(x => x.Association).Include(x => x.Member).ThenInclude(x => x.Region).Where(x => x.Member.RegionId != null && x.PaymentStatus == PaymentStatus.PAID).ToListAsync();
            var memberPaymentsForeigns = await _dbContext.MemberPayments.Include(x => x.Member).ThenInclude(x => x.MembershipType).ThenInclude(x => x.Association).Where(x => x.Member.RegionId == null && x.PaymentStatus == PaymentStatus.PAID).ToListAsync();

            var membersReports = new List<MemberRegionRevenueReportDto>();

            foreach (var chapter in chapters)
            {
                var memberReport = new MemberRegionRevenueReportDto
                {
                    RegionName = chapter.RegionName,
                    RegionRevenue = memberPayments
                        .Where(x => x.Member?.RegionId == chapter.Id)
                        .Sum(x => x.Member.MembershipType.Money * (x.Member.MembershipType.Currency == Currency.ETB ? 1 : 54)),
                    Members = _dbContext.Members.Count(x => x.RegionId == chapter.Id),
                    AssociationId = "", // For region-based reports, AssociationId is empty
                    AssociationName = "" // For region-based reports, AssociationName is empty
                };

                membersReports.Add(memberReport);
            }

            var memberReport2 = new MemberRegionRevenueReportDto
            {
                RegionName = CountryType.FOREIGN.ToString(),
                RegionRevenue = memberPaymentsForeigns
                    .Where(x => x.MembershipTypeId != null)
                    .Sum(x => x.Member.MembershipType.Money * (x.Member.MembershipType.Currency == Currency.ETB ? 1 : 54)),
                Members = _dbContext.Members.Count(x => x.RegionId == Guid.Empty || x.RegionId == null),
                AssociationId = "", // For foreign members, AssociationId is empty
                AssociationName = "" // For foreign members, AssociationName is empty
            };
            membersReports.Add(memberReport2);

            // Add association-based reports for Coalition users
            var associations = await _dbContext.Associations.ToListAsync();
            foreach (var association in associations)
            {
                var associationRevenue = memberPayments
                    .Where(x => x.Member?.MembershipType?.AssociationId == association.Id)
                    .Sum(x => x.Member.MembershipType.Money * (x.Member.MembershipType.Currency == Currency.ETB ? 1 : 54));

                var associationMembers = _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Count(x => x.MembershipType.AssociationId == association.Id);

                var associationReport = new MemberRegionRevenueReportDto
                {
                    RegionName = association.Name, // Use association name as region name for consistency
                    RegionRevenue = associationRevenue,
                    Members = associationMembers,
                    AssociationId = association.Id.ToString(),
                    AssociationName = association.Name
                };

                membersReports.Add(associationReport);
            }

            return membersReports;
        }

        public async Task<ResponseMessage<List<string>>> ImportMemberFormExcel(IFormFile ExcelFile)
        {

            List<string> phoneNumbers = new List<string>();
            List<string> memberships = new List<string>();
            try
            {
                int counter = 0;
                using (var package = new ExcelPackage(ExcelFile.OpenReadStream()))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets[0];

                    int rowCount = worksheet.Dimension.Rows;


                    for (int row = 2; row <= rowCount; row++) // Assuming the data starts from the second row
                    {
                        Member member = new Member();
                        var fullName = worksheet.Cells[row, 1].Value?.ToString() ?? string.Empty;
                        var PhoneNumber = worksheet.Cells[row, 2].Value?.ToString() ?? string.Empty;
                        var email = worksheet.Cells[row, 3].Value?.ToString() ?? string.Empty;
                        
                        DateTime birthDate = DateTime.Now;
                        var result = await CheckIfPhoneNumberExistFromBot(PhoneNumber);

                        if (!result.Exist)
                        {

                            var memberID = "";

                            var paymentStatus = PaymentStatus.EXPIRED;
                            var gender = Gender.MALE;
                    
                            var selectedMembershipType = await _dbContext.MembershipTypes.Where(x => x.ShortCode == "OE").FirstOrDefaultAsync();

                            if (selectedMembershipType == null)
                            {
                                memberships.Add(PhoneNumber);

                                continue;

                            }
                            memberID = await _generalConfig.GenerateCode(0, selectedMembershipType.ShortCode);

               


                            var region = worksheet.Cells[row, 4].Value?.ToString() ?? string.Empty;
                            var selectedRegion = await _dbContext.Regions.Where(x => x.Id == Guid.Parse(region.Trim())).FirstOrDefaultAsync();


                            member.CreatedDate = DateTime.Now;
                            member.Id = Guid.NewGuid();
                            member.FullName = fullName;
                            member.PhoneNumber = PhoneNumber.Trim();
                            member.MembershipTypeId = selectedMembershipType.Id;
                            member.Zone = "";
                            member.Woreda ="";
                            member.RegionId = selectedRegion != null ? selectedRegion.Id : null;
                            member.Email = email;
                            member.Gender = Gender.MALE;

                            member.BirthDate = birthDate;
                            

                            member.MemberId = memberID;

                            await _dbContext.Members.AddAsync(member);
                            await _dbContext.SaveChangesAsync();

                            AddUSerDto addUser = new AddUSerDto
                            {

                                MemberId = member.Id,
                                UserName = member.MemberId,
                                Password = "1234",

                            };
                            var result22 = await _authenticationService.AddUser(addUser);


                            counter += 1;

                        }
                        else
                        {
                           continue;
                        }


                    }
                  
                }
                phoneNumbers.Add($"{counter} Members Added Successfully!");
                phoneNumbers.AddRange(memberships);
                return new ResponseMessage<List<string>>
                {
                    Data =phoneNumbers,
                    Message = "Add Successfully From Excel!!!",
                    Success = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseMessage<List<string>>()
                {

                    Message = ex.InnerException.Message,
                    Success = false
                };
            }


        }

        public async Task<ResponseMessage> DeleteMember(Guid memberId)
        {
            var member = await _dbContext.Members.FindAsync(memberId);

            if (member == null)
            {
                return new ResponseMessage
                {

                    Message = "Member Not Found!!!",
                    Success = false
                };
            }

            var MemberPayments = await _dbContext.MemberPayments.Where(x => x.MemberId == memberId).ToListAsync();


            if (MemberPayments != null)
            {
                _dbContext.MemberPayments.RemoveRange(MemberPayments);
                await _dbContext.SaveChangesAsync();
            }

            if (MemberPayments != null)
            {
                _dbContext.Members.RemoveRange(member);
                await _dbContext.SaveChangesAsync();
            }
            return new ResponseMessage
            {

                Message = "Member Deleted Successfully!!!",
                Success = true
            };

        }

        public async Task<ResponseMessage> UpdateTextReference(string oldTextRn, string newTextRn)
        {

            try
            {
                var memberPayment = await _dbContext.MemberPayments.Where(x => x.TransactionReference == oldTextRn).ToListAsync();
                if (memberPayment.Any())
                {
                    var payment = memberPayment.FirstOrDefault();
                    payment.TransactionReference = newTextRn;

                    await _dbContext.SaveChangesAsync();

                    return new ResponseMessage
                    {
                        Success = true,
                    };


                }

                return new ResponseMessage
                {
                    Success = false,
                    Message = "payment not found"
                };

            }
            catch (Exception ex)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = ex.Message
                };
            }


            throw new NotImplementedException();
        }



        public async Task<ResponseMessage> GetExpiredDate(DateTime lastPaid, Guid membershipTypeId)
        {


            try
            {

                var membershipType = await _dbContext.MembershipTypes.FindAsync(membershipTypeId);

                if (membershipType == null)
                {
                    return new ResponseMessage
                    {
                        Success = false,
                        Message = "Membership type not found."
                    };
                }


                var expiredDate =  membershipType.Category == MemberShipTypeCategory.MONTHLY
                        ? lastPaid.AddDays(membershipType.Counter * 30)
                        : lastPaid.AddDays(membershipType.Counter * 365);
                    
                    
                   



                return new ResponseMessage
                {
                    Success = true,
                    Data = expiredDate
                };




            }
            catch (Exception ex)
            {

                return new ResponseMessage
                {
                    Success = false,
                    Message = ex.Message
                };
            }

        }

        public async Task<MemberVerificationDto> VerifyMemberById(string memberId)
        {
            try
            {
                // Find member by MemberId
                var member = await _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Include(m => m.Region)
                    .FirstOrDefaultAsync(m => m.MemberId == memberId);

                if (member == null)
                {
                    return new MemberVerificationDto
                    {
                        IsVerified = false,
                        Message = "Member not found with the provided ID."
                    };
                }

                // Get the latest payment to check status and expiry
                var latestPayment = await _dbContext.MemberPayments
                    .Where(mp => mp.MemberId == member.Id)
                    .OrderByDescending(mp => mp.LastPaidDate)
                    .FirstOrDefaultAsync();

                // Get association name if available
                string? associationName = null;
                if (member.RegionId.HasValue)
                {
                    var region = await _dbContext.Regions
                        .FirstOrDefaultAsync(r => r.Id == member.RegionId.Value);
                    associationName = region?.RegionName;
                }

                // Get coalition name
                var coalition = await _dbContext.Coalition.FirstOrDefaultAsync();
                string? coalitionName = coalition?.Name;

                var verificationData = new MemberVerificationDataDto
                {
                    Id = member.Id,
                    FullName = member.FullName,
                    MemberId = member.MemberId,
                    ImagePath = member.ImagePath,
                    Email = member.Email,
                    PhoneNumber = member.PhoneNumber,
                    Zone = member.Zone,
                    Woreda = member.Woreda,
                    BirthDate = member.BirthDate,
                    MembershipTypeName = member.MembershipType?.Name ?? "Unknown",
                    AssociationName = associationName,
                    CoalitionName = coalitionName,
                    ExpiryDate = latestPayment?.ExpiryDate,
                    PaymentStatus = latestPayment?.PaymentStatus.ToString() ?? "No Payment",
                    IsProfileCompleted = member.IsProfileCompleted,
                    CreatedDate = member.CreatedDate
                };

                return new MemberVerificationDto
                {
                    IsVerified = true,
                    Message = "Member verified successfully.",
                    Data = verificationData
                };
            }
            catch (Exception ex)
            {
                return new MemberVerificationDto
                {
                    IsVerified = false,
                    Message = $"Error verifying member: {ex.Message}"
                };
            }
        }


        public async Task<ResponseMessage> RemoveProfileImage(Guid memberId)
        {
            try
            {
                var member = await _dbContext.Members.FindAsync(memberId);
                if (member == null)
                {
                    return new ResponseMessage { Success = false, Message = "Member not found" };
                }

                member.ImagePath = null;
                await _dbContext.SaveChangesAsync();

                return new ResponseMessage { Success = true, Message = "Profile image removed successfully" };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { Success = false, Message = $"Error removing profile image: {ex.Message}" };
            }
        }
    }
}
