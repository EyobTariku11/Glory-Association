using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IEducationalFieldService
    {

        Task<ResponseMessage> AddEducationalField(EducationalFieldPostDto EducationalFieldPost);
        Task<List<EducationalFieldGetDto>> GetEducationalFieldList();
        Task<ResponseMessage> UpdateEducationalField(EducationalFieldGetDto educationalFieldGet);
        Task<ResponseMessage> DeleteEducationalField(Guid educationalFieldId);
    }
}
