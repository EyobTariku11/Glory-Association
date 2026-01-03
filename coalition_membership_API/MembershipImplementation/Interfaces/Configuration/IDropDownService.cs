using MembershipImplementation.DTOS.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Model.Configuration;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IDropDownService
    {
        
        Task<List<SelectListDto>> GetRegionDropdownList(string countryType);
        Task<List<SelectListDto>> GetZoneDropdownList(Guid regionId);
        Task<List<SelectListDto>> GetMembershipTypesDropDown(Guid associationId);


    }
}
