using MembershipInfrustructure.Model.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.DTOS.Configuration
{
    public record MembershipTypePostDto
    {

        public Guid AssociationId { get; set; }
        public string Name { get; set; } = null!;

        public string ShortCode { get; set; } = null!;

        public int Counter { get; set; }
        
        public Currency Currency { get; set; }
        
        public double Money { get; set; }

        public string Description { get; set; }

        public MemberShipTypeCategory MembershipCategory { get; set; }

        public string CreatedById { get; set; }

    }

    public record MembershipTypeGetDto : MembershipTypePostDto
    {

        public Guid Id { get; set; }

     
        public string CurrencyGet {get;set; }
        public string Description { get; set; }
        public string MembershipCategoryGet { get; set; }

    }
    
    
    
}
