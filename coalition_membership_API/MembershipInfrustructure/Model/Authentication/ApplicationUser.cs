using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipInfrustructure.Model.Authentication
{
    public class ApplicationUser : IdentityUser
    {
        public Guid? MemberId { get; set; }
        public Guid ? CoalitionId { get; set; }
        
        public Guid ? AssociationId { get; set; }
        public UserRole Role { get; set; }
        public RowStatus RowStatus { get; set; }
     
    }
    
    public enum UserRole { Coalition, Association, Member }
}
