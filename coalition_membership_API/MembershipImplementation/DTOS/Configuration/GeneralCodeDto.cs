using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.DTOS.Configuration
{
    public class GeneralCodeDto
    {
        public Guid Id { get; set; }
        public string GeneralCode { get; set; } = null!;
        public string InitialName { get; set; } = null!;
        public int Pad { get; set; }
        public int CurrentNumber { get; set; }
        public Guid AssociationId { get; set; }
    }
}
