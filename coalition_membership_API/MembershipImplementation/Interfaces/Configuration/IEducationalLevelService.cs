using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IEducationalLevelService
    {
        Task<ResponseMessage> AddEducationalLevel(EducationalLevelPostDto EducationalLevelPost);
        Task<List<EducationalLevelGetDto>> GetEducationalLevelList();
        Task<ResponseMessage> UpdateEducationalLevel(EducationalLevelGetDto EducationalLevelGet);

        Task<ResponseMessage> DeleteEducationalLevel(Guid educationalLevelId);

    }
}
