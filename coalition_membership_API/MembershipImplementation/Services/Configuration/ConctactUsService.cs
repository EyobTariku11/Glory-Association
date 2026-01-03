using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Configuration;
using Microsoft.EntityFrameworkCore;

namespace MembershipImplementation.Services.Configuration;

public class ConctactUsService :IContactService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IGeneralConfigService _generalConfigService;

    public ConctactUsService(ApplicationDbContext dbContext, IGeneralConfigService generalConfigService)
    {
        _generalConfigService = generalConfigService;
        _dbContext = dbContext;
    }

    public async Task<ResponseMessage<string>> AddContactUs(ContactUsDto contactUsDto)
    {
        try
        {
            var contactUs = new ContactUs
            {
                Id = Guid.NewGuid(),
                Name = contactUsDto.Name,
                Email = contactUsDto.Email,
                Subject = contactUsDto.Subject,
                Message = contactUsDto.Message,
                CreatedDate = DateTime.Now
            };


            await _dbContext.AddAsync(contactUs);
            await _dbContext.SaveChangesAsync();

            return new ResponseMessage<string>()
            {
                Success = true,
                Data = contactUs.Id.ToString(),
                Message =
                    $"Dear {contactUsDto.Name}, thank you for reaching out to us. We have successfully received your message and will respond to you shortly. We appreciate your patience"
            };
        }
        catch (Exception ex)
        {

            return ExceptionHandler.HandleException<string>(ex);
        }
    }

    public async Task<ResponseMessage<List<ContactUsDto>>> GetContactMessages()
    {
        try
        {
            var contactUs = await _dbContext.ContactUs.Select((x => new ContactUsDto
            {
                Email = x.Email,
                Name = x.Name,
                Subject = x.Subject,
                CreatedDate = x.CreatedDate,
                Message = x.Message,
                Id = x.Id.ToString(),
            })).OrderByDescending(x=>x.CreatedDate).ToListAsync();

            return new ResponseMessage<List<ContactUsDto>>
            {
                Success = true,
                Message = "Contact Us Message successfully fetched.",
                Data = contactUs
            };

        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException <List<ContactUsDto>> (ex);
        }
    }
}