using MembershipImplementation.DTOS.Configuration;
using MembershipInfrustructure.Model.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Implementation.Helper
{

    public class ResponseMessage<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? ErrorCode { get; set; }
        public T? Data { get; set; }
    }
    public class ResponseMessage
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public object Data { get; set; } = null!;
    }

    public class ResponseMessage2
    {
        public bool Exist { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }

        public MemberTelegramDto Member { get; set; }


    }

    public class MessageRequest
    {
        public string PhoneNumber { get; set; }
        public string Message { get; set; }
        
        public string ? Country { get; set; }


    }

}
