
using Implementation.Helper;
using MembershipImplementation.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.Interfaces.Configuration
{
    public interface IEmailService
    {
        Task<ResponseMessage> Send(EmailMetadata emailMetadata);
    }
}
