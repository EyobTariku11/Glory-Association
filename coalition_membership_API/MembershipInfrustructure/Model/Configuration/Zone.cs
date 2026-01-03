using MembershipInfrustructure.Model.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipInfrustructure.Model.Configuration
{
    public class Zone :WithIdModel
    {
        public string ZoneName { get; set; } = null!;

        public virtual Region Region { get; set; } = null!;
        public Guid RegionId { get; set; }

    }
}
