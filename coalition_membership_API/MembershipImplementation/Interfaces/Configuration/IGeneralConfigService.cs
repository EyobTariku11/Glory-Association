using Implementation.Helper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipImplementation.DTOS.Configuration;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IGeneralConfigService
    {
        Task<string> GenerateCode(GeneralCodeType GeneralCodeType, string memberType);
        Task<string> GenerateConsecutiveMemberId(GeneralCodeType GeneralCodeType, string memberType, Guid associationId);
        Task<List<GeneralCodeDto>> GetGeneralCodes(Guid? associationId = null);
        Task<ResponseMessage<Guid>> UpsertGeneralCode(GeneralCodeUpsertDto dto);
        Task<string> UploadFiles(IFormFile formFile, string Name, string FolderName);

        Task<ResponseMessage<string>> SendWhatsAppMessage(MessageRequest messageRequest);
        Task<ResponseMessageNot<string>> SendNotificationToAllUsersAsync(NotificationRequestDto request);
        Task<string> GetFiles(string path);

        string Encrypt(string text, string encryptionKey);

        Task<ResponseMessage> SendMessage(MessageRequest messageRequest);
        string Decrypt(string encryptedText, string encryptionKey);

    }
}
