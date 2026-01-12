using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IRegionService
    {
        Task<ResponseMessage<string>> AddRegion(RegionPostDto regionPost);
        Task<ResponseMessage<List<RegionGetDto>>> GetRegionList();
        Task<ResponseMessage<string>> UpdateRegion(RegionPostDto regionPost);
        Task<ResponseMessage<string>> DeleteRegion(Guid regionId);
    }
}
