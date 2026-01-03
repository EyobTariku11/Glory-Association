using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipInfrustructure.Model.Users
{
    public class Member : WithIdModel
    {
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? ImagePath { get; set; }
        public string? Email { get; set; }
        public Guid? RegionId { get; set; }
        public virtual Region? Region { get; set; }
        public string? Zone { get; set; }
        public string? Woreda { get; set; }
        public DateTime BirthDate { get; set; }
        public Guid MembershipTypeId { get; set; }
        public virtual MembershipType MembershipType { get; set; } = null!;
        public string? MemberId { get; set; }
        public Gender Gender { get; set; }
        public bool IsProfileCompleted { get; set; }
        public bool IsBirthDateToday { get; set; }
        public string? ChatId { get; set; }
        
        
        public virtual ICollection<MemberPayment> MemberPayments { get; set; } = new List<MemberPayment>();

        
        
    }
  
}
