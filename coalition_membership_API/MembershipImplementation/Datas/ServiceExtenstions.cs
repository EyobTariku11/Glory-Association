using Implementation.Interfaces.Authentication;
using Implementation.Services.Authentication;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Services.Configuration;
using MembershipImplementation.Interfaces.HRM;
using MembershipImplementation.Services.HRM;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipImplementation.Interfaces.Association;
using MembershipImplementation.Interfaces.Donation;
using MembershipImplementation.Interfaces.Message;
using MembershipImplementation.Interfaces.Telegram;
using MembershipImplementation.Interfaces.Users;
using MembershipImplementation.Interfaces.Events;
using MembershipImplementation.Interfaces.News;
using MembershipImplementation.Interfaces.Sponsor;
using MembershipImplementation.Interfaces.Coalition;
using MembershipImplementation.Interfaces.Advertisement;
using MembershipImplementation.Services.Association;
using MembershipImplementation.Services.Donation;
using MembershipImplementation.Services.Message;
using MembershipImplementation.Services.Telegram;
using MembershipImplementation.Services.Users;
using MembershipImplementation.Services.Events;
using MembershipImplementation.Services.News;
using MembershipImplementation.Services.Sponsor;
using MembershipImplementation.Services.Coalition;
using MembershipImplementation.Services.Advertisement;


namespace MembershipImplementation.Datas
{
    public static class ServiceExtenstions
    {
        public static IServiceCollection AddCoreBusiness(this IServiceCollection services)
        {
            services.AddScoped<IAuthenticationService, AuthenticationService>();
         
            services.AddScoped<IGeneralConfigService, GeneralConfigService>();
            services.AddScoped<IMemberService, MemberService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddHttpClient();

            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IEventMessageService, EventMessageService>();


            services.AddScoped<IContactService, ConctactUsService>();
            services.AddScoped<ICompanyProfileService, CompanyProfileService>();

            services.AddScoped<ITelegramService, TelegramService>();
            services.AddScoped<IDonationEventService,DonationEventService>();
            services.AddScoped<IEventService, EventService>();
        services.AddScoped<IDonationTargetService, DonationTargetService>();
        services.AddScoped<INewsService, NewsService>(); // Added
        services.AddScoped<ISponsorService, SponsorService>(); // Added
        services.AddScoped<IBoardMemberService, BoardMemberService>(); // Added
        services.AddScoped<IAdvertisementService, AdvertisementService>(); // Added
            #region             
            services.AddScoped<IRegionService, RegionService>();
            services.AddScoped<IZoneService, ZoneService>();
         
            services.AddScoped<IMembershipTypeService, MembershipTypeService>();
            services.AddScoped<IDropDownService, DropDownService>();
            
            services.AddScoped<IAssociationService, AssociationService>();
            services.AddScoped<ICoalitionService, CoalitionService>();

           


            #endregion


            return services;
        }
    }
}
