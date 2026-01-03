using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IAnnouncmentService
    {

        Task<ResponseMessage> AddAnnouncment(AnnouncmentPostDto AnnouncmentPost);
        Task<List<AnnouncmentGetDto>> GetAnnouncmentList();
        Task<ResponseMessage> UpdateAnnouncment(AnnouncmentGetDto AnnouncmentPost);
        Task<ResponseMessage> DeleteAnnouncment(Guid AnnouncmentId);
    }
}
