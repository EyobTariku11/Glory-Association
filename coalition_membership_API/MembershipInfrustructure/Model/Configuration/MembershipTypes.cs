using MembershipInfrustructure.Model.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Model.Association;
using MembershipInfrustructure.Model.Users;

namespace MembershipInfrustructure.Model.Configuration
{
    public class MembershipType : WithIdModel
    {
        public string Name { get; set; } = null!;
        public string ShortCode { get; set; } = null!;
        public int Counter { get; set; }
        public double Money { get; set; }
        public Currency Currency { get; set; }
        public string? Description { get; set; }
        
        public MemberShipTypeCategory Category { get; set; }
        
        public Guid AssociationId { get; set; }
        public virtual AssociationModel Association { get; set; } = null!;
        
        public virtual ICollection<Member> Members { get; set; } = new List<Member>();

    }

    public enum Currency { ETB, USD }
    public enum MemberShipTypeCategory { MONTHLY, YEARLY }
}
