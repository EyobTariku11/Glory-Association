using Implementation.DTOS.Authentication;
using Implementation.Helper;
using Implementation.Interfaces.Authentication;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.Interfaces.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using MembershipInfrustructure.Model.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.Services.Configuration
{
    public class RegionService : IRegionService
    {

        private readonly ApplicationDbContext _dbContext;

         private UserManager<ApplicationUser> _userManager;

        public RegionService(ApplicationDbContext dbContext,   UserManager<ApplicationUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }


        public async Task<ResponseMessage<string>> AddRegion(RegionPostDto regionPost)
        {
            try
            {
                Region region = new Region
                {
                    Id = Guid.NewGuid(),
                    RegionName = regionPost.RegionName,
                    CountryType = regionPost.CountryType,
                    CreatedById = regionPost.CreatedById,
                    RowStatus = RowStatus.ACTIVE
                };

                await _dbContext.Regions.AddAsync(region);
                await _dbContext.SaveChangesAsync();

                return new ResponseMessage<string>
                {
                    Data = region.Id.ToString(),
                    Message = "Added Successfully",
                    Success = true
                };
            }
            catch (Exception ex)
            {

                return ExceptionHandler.HandleException<string>(ex);
            }
        }


        public async Task<ResponseMessage<List<RegionGetDto>>> GetRegionList()
        {
            try
            {
                var regionList = await _dbContext.Regions
                    .AsNoTracking()
                    .Select(x=> new RegionGetDto
                    {
                        Id = x.Id,
                        RegionName = x.RegionName,
                        CountryType = x.CountryType,
                        CountryTypeGet = x.CountryType.ToString()
                    } )
                    .ToListAsync();

                return new ResponseMessage<List<RegionGetDto>>
                {
                    Data = regionList,
                    Success = true,
                    Message = "Successfully retrieved",
                };

            }
            catch (Exception ex)
            {
                return ExceptionHandler.HandleException<List<RegionGetDto>>(ex);
            }
        }

        
    }
}
