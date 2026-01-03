using MembershipImplementation.DTOS.HRM;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Data;

namespace Implementation.DTOS.Authentication
{
    public class UserListDto
    {
        public string Id { get; set; } = null!;
        public Guid? UserId { get; set; }
        public string Name { get; set; } = null!;
        
        public string ImagePath { get; set; }

        public List<RoleDropDown> Roles { get; set; }

        public string Email { get; set; }

        public string UserName { get; set; } = null!;
        public string Status { get; set; } = null!;
        

    

    }

    public class RoleDropDown
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
    }



    public class AddUSerDto
    {
        public Guid? MemberId { get; set; }
        public Guid ? AdminId { get; set; }
        public Guid ? AssociationId { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; } = null!;
        public string? Password { get; set; }
        public string ? Roles { get; set; }  
        
        public EnumList.RowStatus RowStatus { get; set; } = EnumList.RowStatus.ACTIVE;
    }

    public class UserRoleDto
    {
        public string UserId { get; set; } = null!;
        public string RoleName { get; set; } = null!;
    }


}
