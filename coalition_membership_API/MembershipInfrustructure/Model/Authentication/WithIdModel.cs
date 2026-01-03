using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipInfrustructure.Model.Authentication
{
    public class WithIdModel
    {
        public Guid Id { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedById { get; set; } 
        public RowStatus RowStatus { get; set; }
    }
}
