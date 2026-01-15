using Implementation.Helper;
using MembershipImplementation.Interfaces.Configuration;
using MembershipInfrustructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FirebaseAdmin.Messaging;
using MembershipImplementation.DTOS.Configuration;
using MembershipInfrustructure.Model.Configuration;

namespace MembershipImplementation.Services.Configuration
{
    public class GeneralConfigService : IGeneralConfigService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly HttpClient _httpClient;

        public GeneralConfigService(ApplicationDbContext dbContext, IConfiguration configuration,
            IHttpClientFactory httpClientFactory, HttpClient httpClient)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _httpClient = httpClient;
        }

        public async Task<string> GenerateCode(EnumList.GeneralCodeType GeneralCodeType, string memberType)
        {
            var curentCode =
                await _dbContext.GeneralCodes.FirstOrDefaultAsync(x => x.GeneralCodeType == GeneralCodeType);
            if (curentCode != null)
            {

                var randomNumber = new Random().Next((int)Math.Pow(10, curentCode.Pad - 1),
                    (int)Math.Pow(10, curentCode.Pad) - 1);
                var generatedCode = $"{curentCode.InitialName}-{memberType}-{randomNumber}";

                curentCode.CurrentNumber += 1;
                await _dbContext.SaveChangesAsync();
                return generatedCode;
            }

            return "";
        }

       public async Task<string> GenerateConsecutiveMemberId(
    EnumList.GeneralCodeType GeneralCodeType,
    string memberType, // still here to match interface
    Guid associationId)
{
    var currentCode = await _dbContext.GeneralCodes
        .FirstOrDefaultAsync(x => x.GeneralCodeType == GeneralCodeType && x.AssociationId == associationId);

    if (currentCode != null)
    {
        // Increment the current number for consecutive ID generation
        currentCode.CurrentNumber += 1;

        // Generate the member ID with consecutive number and year
        var consecutiveNumber = currentCode.CurrentNumber.ToString().PadLeft(currentCode.Pad, '0');
        var year = GetEthiopianYear(DateTime.UtcNow);
        var generatedCode = $"{currentCode.InitialName}-{consecutiveNumber}-{year}";

        await _dbContext.SaveChangesAsync();
        return generatedCode;
    }

    return "";
}

private int GetEthiopianYear(DateTime date)
{
    int year = date.Year;
    int month = date.Month;
    int day = date.Day;

    // Ethiopian New Year (Meskerem 1) is usually Sept 11 (or 12 in leap years)
    if (month < 9 || (month == 9 && day < 11))
    {
        return year - 8;
    }
    else
    {
        return year - 7;
    }
}


        public async Task<List<GeneralCodeDto>> GetGeneralCodes(Guid? associationId = null)
        {
            var q = _dbContext.GeneralCodes.AsNoTracking();

            if (associationId.HasValue && associationId.Value != Guid.Empty)
            {
                q = q.Where(x => x.AssociationId == associationId.Value);
            }

            return await q
                .OrderBy(x => x.AssociationId)
                .ThenBy(x => x.GeneralCodeType)
                .Select(x => new GeneralCodeDto
                {
                    Id = x.Id,
                    GeneralCode = x.GeneralCodeType.ToString(),
                    InitialName = x.InitialName,
                    Pad = x.Pad,
                    CurrentNumber = x.CurrentNumber,
                    AssociationId = x.AssociationId
                })
                .ToListAsync();
        }

        public async Task<ResponseMessage<Guid>> UpsertGeneralCode(GeneralCodeUpsertDto dto)
        {
            try
            {
                if (dto.AssociationId == Guid.Empty)
                {
                    return new ResponseMessage<Guid>
                    {
                        Success = false,
                        Message = "AssociationId is required",
                        Data = Guid.Empty
                    };
                }

                var entity = dto.Id.HasValue
                    ? await _dbContext.GeneralCodes.FirstOrDefaultAsync(x => x.Id == dto.Id.Value)
                    : await _dbContext.GeneralCodes.FirstOrDefaultAsync(x =>
                        x.AssociationId == dto.AssociationId && x.GeneralCodeType == dto.GeneralCodeType);

                if (entity == null)
                {
                    entity = new GeneralCodes
                    {
                        Id = Guid.NewGuid(),
                        AssociationId = dto.AssociationId,
                        GeneralCodeType = dto.GeneralCodeType,
                        InitialName = dto.InitialName,
                        Pad = dto.Pad,
                        CurrentNumber = dto.CurrentNumber,
                        CreatedById = dto.CreatedById,
                        RowStatus = EnumList.RowStatus.ACTIVE,
                        CreatedDate = DateTime.UtcNow
                    };
                    _dbContext.GeneralCodes.Add(entity);
                }
                else
                {
                    entity.GeneralCodeType = dto.GeneralCodeType;
                    entity.InitialName = dto.InitialName;
                    entity.Pad = dto.Pad;
                    entity.CurrentNumber = dto.CurrentNumber;
                    if (!string.IsNullOrWhiteSpace(dto.CreatedById))
                        entity.CreatedById = dto.CreatedById;
                }

                await _dbContext.SaveChangesAsync();

                return new ResponseMessage<Guid>
                {
                    Success = true,
                    Message = "General code saved",
                    Data = entity.Id
                };
            }
            catch (Exception ex)
            {
                return new ResponseMessage<Guid>
                {
                    Success = false,
                    Message = ex.Message,
                    Data = Guid.Empty
                };
            }
        }

        public async Task<string> GetFiles(string path)
        {
            byte[] imageArray = await File.ReadAllBytesAsync(path);
            string imageRepresentation = Convert.ToBase64String(imageArray);
            return imageRepresentation.ToString();
        }

        public async Task<string> UploadFiles(IFormFile formFile, string Name, string FolderName)
        {
            var path = Path.Combine("wwwroot", FolderName);
            string pathToSave = Path.Combine(Directory.GetCurrentDirectory(), path);

            if (!Directory.Exists(pathToSave))
                Directory.CreateDirectory(pathToSave);

            if (formFile != null && formFile.Length > 0)
            {
                try
                {
                    string fileExtension = Path.GetExtension(formFile.FileName);
                    string uniqueSuffix = Guid.NewGuid().ToString().Substring(0, 8);
                    string fileName = $"{Name}_{uniqueSuffix}{fileExtension}";
                    string filePath = Path.Combine(pathToSave, fileName);

                    if (File.Exists(filePath))
                        File.Delete(filePath);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await formFile.CopyToAsync(stream);
                    }

                    var newPath = Path.Combine(path, fileName);
                    return newPath;
                }
                catch (Exception ex)
                {
                    return ex.Message;
                }
            }

            return "";
        }




        public string Encrypt(string text, string encryptionKey)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(encryptionKey);
                aesAlg.IV = new byte[16]; // Initialization Vector (IV)

                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            swEncrypt.Write(text);
                        }
                    }

                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }

        public string Decrypt(string encryptedText, string encryptionKey)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(encryptionKey);
                aesAlg.IV = new byte[16]; // Initialization Vector (IV)

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(encryptedText)))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {
                            return srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
        }

        public async Task<ResponseMessage> SendMessage(MessageRequest messageRequest)
        {
            try
            {
                // Validate the token
                string token = _configuration["SMSSettings:token"];
                if (string.IsNullOrEmpty(token))
                {
                    return new ResponseMessage
                    {
                        Success = false,
                        Message = "SMS token not configured"
                    };
                }

                // Get the API URL from appsettings.json
                string apiUrl = _configuration["SMSSettings:ApiUrl"];
                if (string.IsNullOrEmpty(apiUrl))
                {
                    return new ResponseMessage
                    {
                        Success = false,
                        Message = "SMS API URL not configured"
                    };
                }

                // Validate phone number
                if (string.IsNullOrEmpty(messageRequest.PhoneNumber))
                {
                    return new ResponseMessage
                    {
                        Success = false,
                        Message = "Phone number is required"
                    };
                }

                // Validate message content
                if (string.IsNullOrEmpty(messageRequest.Message))
                {
                    return new ResponseMessage
                    {
                        Success = false,
                        Message = "Message content is required"
                    };
                }

                HttpClient httpClient = _httpClientFactory.CreateClient();

                // Create a new FormUrlEncodedContent object and add the required parameters.
                var keyValues = new List<KeyValuePair<string, string>>
                {
                    new KeyValuePair<string, string>("phone", messageRequest.PhoneNumber),
                    new KeyValuePair<string, string>("msg", messageRequest.Message),
                    new KeyValuePair<string, string>("token", token)
                };
                var formData = new FormUrlEncodedContent(keyValues);

                // Send the POST request to the SMS API.
                HttpResponseMessage response = await httpClient.PostAsync(apiUrl, formData);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    return new ResponseMessage
                    {
                        Success = true,
                        Message = "Message sent successfully.",
                        Data = responseContent
                    };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return new ResponseMessage
                    {
                        Success = false,
                        Message = $"Failed to send message. Status: {(int)response.StatusCode}, Error: {errorContent}"
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = $"Internal Server Error: {ex.Message}"
                };
            }
        }
        
        public async Task<ResponseMessageNot<string>> SendNotificationToAllUsersAsync(NotificationRequestDto request)
        {
            try
            {
                var message = new FirebaseAdmin.Messaging.Message()
                {
                    Notification = new Notification()
                    {
                        Title = request.Title,
                        Body = request.Body,
                    },
                    Topic = "all_users",
                    Android = new AndroidConfig()
                    {
                        Notification = new AndroidNotification()
                        {
                            ChannelId = "default_channel",
                            Priority = NotificationPriority.HIGH,
                            Icon = "ic_launcher",
                            Sound = "default"
                        }
                    }
                };

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);

                return ResponseMessageNot<string>.SuccessResponse(response, "Notification sent successfully.");
            }
            catch (Exception ex)
            {
                return ResponseMessageNot<string>.FailureResponse($"Error: {ex.Message}");
            }
        }

        public async Task<Implementation.Helper.ResponseMessage<string>> SendWhatsAppMessage(MessageRequest messageRequest)
        {
            try
            {
                var url = _configuration["WhatsAppSettings:ApiUrl"];
                var accessToken = _configuration["WhatsAppSettings:token"];
                
                var phoneNumber = FormatPhoneNumber(messageRequest.PhoneNumber,messageRequest.Country);

                var payload = new
                {
                    messaging_product = "whatsapp",
                    to = phoneNumber,
                    type = "template",
                    template = new
                    {
                        name = "hello_world",
                        language = new { code = "en_US" }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseData = await response.Content.ReadAsStringAsync();
                    return new Implementation.Helper.ResponseMessage<string>()
                    {
                        Success = true,
                        Message = "Message sent successfully."
                    };
                }
                else
                {
                    return new Implementation.Helper.ResponseMessage<string>()
                    {
                        Success = true,
                        Message = $"{(int)response.StatusCode} Failed to send message."
                    };
                }

            }
            catch (Exception ex)
            {
                return ExceptionHandler.HandleException<string>(ex);
            }

        }

        static string FormatPhoneNumber(string phoneNumber, string country)
    {
        // Comprehensive list of countries and their dialing codes
        var countryCodes = new Dictionary<string, string>()
        {
            { "Afghanistan", "+93" },
            { "Albania", "+355" },
            { "Algeria", "+213" },
            { "Andorra", "+376" },
            { "Angola", "+244" },
            { "Antigua and Barbuda", "+1-268" },
            { "Argentina", "+54" },
            { "Armenia", "+374" },
            { "Australia", "+61" },
            { "Austria", "+43" },
            { "Azerbaijan", "+994" },
            { "Bahamas", "+1-242" },
            { "Bahrain", "+973" },
            { "Bangladesh", "+880" },
            { "Barbados", "+1-246" },
            { "Belarus", "+375" },
            { "Belgium", "+32" },
            { "Belize", "+501" },
            { "Benin", "+229" },
            { "Bhutan", "+975" },
            { "Bolivia", "+591" },
            { "Bosnia and Herzegovina", "+387" },
            { "Botswana", "+267" },
            { "Brazil", "+55" },
            { "Brunei", "+673" },
            { "Bulgaria", "+359" },
            { "Burkina Faso", "+226" },
            { "Burundi", "+257" },
            { "Cabo Verde", "+238" },
            { "Cambodia", "+855" },
            { "Cameroon", "+237" },
            { "Canada", "+1" },
            { "Central African Republic", "+236" },
            { "Chad", "+235" },
            { "Chile", "+56" },
            { "China", "+86" },
            { "Colombia", "+57" },
            { "Comoros", "+269" },
            { "Congo", "+242" },
            { "Costa Rica", "+506" },
            { "Croatia", "+385" },
            { "Cuba", "+53" },
            { "Cyprus", "+357" },
            { "Czech Republic", "+420" },
            { "Denmark", "+45" },
            { "Djibouti", "+253" },
            { "Dominica", "+1-767" },
            { "Dominican Republic", "+1-809" },
            { "Ecuador", "+593" },
            { "Egypt", "+20" },
            { "El Salvador", "+503" },
            { "Equatorial Guinea", "+240" },
            { "Eritrea", "+291" },
            { "Estonia", "+372" },
            { "Eswatini", "+268" },
            { "Ethiopia", "+251" },
            { "Fiji", "+679" },
            { "Finland", "+358" },
            { "France", "+33" },
            { "Gabon", "+241" },
            { "Gambia", "+220" },
            { "Georgia", "+995" },
            { "Germany", "+49" },
            { "Ghana", "+233" },
            { "Greece", "+30" },
            { "Grenada", "+1-473" },
            { "Guatemala", "+502" },
            { "Guinea", "+224" },
            { "Guyana", "+592" },
            { "Haiti", "+509" },
            { "Honduras", "+504" },
            { "Hungary", "+36" },
            { "Iceland", "+354" },
            { "India", "+91" },
            { "Indonesia", "+62" },
            { "Iran", "+98" },
            { "Iraq", "+964" },
            { "Ireland", "+353" },
            { "Israel", "+972" },
            { "Italy", "+39" },
            { "Jamaica", "+1-876" },
            { "Japan", "+81" },
            { "Jordan", "+962" },
            { "Kazakhstan", "+7" },
            { "Kenya", "+254" },
            { "Kiribati", "+686" },
            { "Kuwait", "+965" },
            { "Kyrgyzstan", "+996" },
            { "Laos", "+856" },
            { "Latvia", "+371" },
            { "Lebanon", "+961" },
            { "Lesotho", "+266" },
            { "Liberia", "+231" },
            { "Libya", "+218" },
            { "Liechtenstein", "+423" },
            { "Lithuania", "+370" },
            { "Luxembourg", "+352" },
            { "Madagascar", "+261" },
            { "Malawi", "+265" },
            { "Malaysia", "+60" },
            { "Maldives", "+960" },
            { "Mali", "+223" },
            { "Malta", "+356" },
            { "Marshall Islands", "+692" },
            { "Mauritania", "+222" },
            { "Mauritius", "+230" },
            { "Mexico", "+52" },
            { "Micronesia", "+691" },
            { "Moldova", "+373" },
            { "Monaco", "+377" },
            { "Mongolia", "+976" },
            { "Montenegro", "+382" },
            { "Morocco", "+212" },
            { "Mozambique", "+258" },
            { "Myanmar", "+95" },
            { "Namibia", "+264" },
            { "Nauru", "+674" },
            { "Nepal", "+977" },
            { "Netherlands", "+31" },
            { "New Zealand", "+64" },
            { "Nicaragua", "+505" },
            { "Niger", "+227" },
            { "Nigeria", "+234" },
            { "North Korea", "+850" },
            { "North Macedonia", "+389" },
            { "Norway", "+47" },
            { "Oman", "+968" },
            { "Pakistan", "+92" },
            { "Palau", "+680" },
            { "Palestine", "+970" },
            { "Panama", "+507" },
            { "Papua New Guinea", "+675" },
            { "Paraguay", "+595" },
            { "Peru", "+51" },
            { "Philippines", "+63" },
            { "Poland", "+48" },
            { "Portugal", "+351" },
            { "Qatar", "+974" },
            { "Romania", "+40" },
            { "Russia", "+7" },
            { "Rwanda", "+250" },
            { "Saint Kitts and Nevis", "+1-869" },
            { "Saint Lucia", "+1-758" },
            { "Saint Vincent and the Grenadines", "+1-784" },
            { "Samoa", "+685" },
            { "San Marino", "+378" },
            { "Saudi Arabia", "+966" },
            { "Senegal", "+221" },
            { "Serbia", "+381" },
            { "Seychelles", "+248" },
            { "Sierra Leone", "+232" },
            { "Singapore", "+65" },
            { "Slovakia", "+421" },
            { "Slovenia", "+386" },
            { "Solomon Islands", "+677" },
            { "Somalia", "+252" },
            { "South Africa", "+27" },
            { "South Korea", "+82" },
            { "Spain", "+34" },
            { "Sri Lanka", "+94" },
            { "Sudan", "+249" },
            { "Suriname", "+597" },
            { "Sweden", "+46" },
            { "Switzerland", "+41" },
            { "Syria", "+963" },
            { "Taiwan", "+886" },
            { "Tajikistan", "+992" },
            { "Tanzania", "+255" },
            { "Thailand", "+66" },
            { "Togo", "+228" },
            { "Tonga", "+676" },
            { "Trinidad and Tobago", "+1-868" },
            { "Tunisia", "+216" },
            { "Turkey", "+90" },
            { "Turkmenistan", "+993" },
            { "Tuvalu", "+688" },
            { "Uganda", "+256" },
            { "Ukraine", "+380" },
            { "United Arab Emirates", "+971" },
            { "United Kingdom", "+44" },
            { "United States", "+1" },
            { "Uruguay", "+598" },
            { "Uzbekistan", "+998" },
            { "Vanuatu", "+678" },
            { "Vatican City", "+379" },
            { "Venezuela", "+58" },
            { "Vietnam", "+84" },
            { "Yemen", "+967" },
            { "Zambia", "+260" },
            { "Zimbabwe", "+263" }
        };

        // Check if the country exists in the dictionary
        if (!countryCodes.TryGetValue(country, out string countryCode))
        {
            throw new ArgumentException($"Country '{country}' not found.");
        }
        string cleanedNumber = Regex.Replace(phoneNumber, @"^0+", "");
        // Format the phone number with the country code
        return $"{countryCode}{cleanedNumber}";
    }

    }
}

