using MembershipInfrustructure.Model.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.DTOS.Payment
{
    public record MemberPaymentDto
    {
        public Guid MemberId { get; set; }
        public string Text_Rn { get; set; }
        public double Payment { get; set; }
        public string Url { get; set; }
        public Guid MembershipTypeId { get; set; }    
    }


    public record DonationPaymentDto
    {
        public Guid EventId { get; set; }
        public string Text_Rn { get; set; }
        public double Payment { get; set; }
      
    }
}
