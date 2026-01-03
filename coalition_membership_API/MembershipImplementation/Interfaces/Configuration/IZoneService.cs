using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IZoneService
    {
        Task<ResponseMessage> AddZone(ZonePostDto ZonePost);
        Task<List<ZoneGetDto>> GetZoneList();
        Task<ResponseMessage> UpdateZone(ZonePostDto ZonePost);

        Task<ResponseMessage> DeleteZone(Guid zoneId);
    }
}
