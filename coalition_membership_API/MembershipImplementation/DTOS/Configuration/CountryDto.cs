using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MembershipInfrustructure.Model.Configuration;

namespace MembershipImplementation.DTOS.Configuration
{
    
    public record RegionPostDto
    {
        public Guid? Id { get; set; }
        public string RegionName { get; set; } = null!;
        public string? UserName { get; set; }
        public string? Password { get; set; } 
        public CountryType  CountryType { get; set; }
        
        public string? CreatedById { get; set; }

    }

    public record RegionGetDto
    {
        public Guid Id { get; set; }
        public string RegionName { get; set; } = null!;
        public string? CountryTypeGet { get; set; }
        
        public CountryType CountryType { get; set; }    
        
       

    }
    public class ZonePostDto
    {
        public Guid? Id { get; set; }
        public string ZoneName { get; set; } = null!;
        public Guid RegionId { get; set; }
        public string? CreatedById { get; set; } = null!;
    }

    public record ZoneGetDto
    {
        public Guid Id { get; set; }
        public Guid RegionId { get; set; }
        public string Country { get; set; }
        public string CountryName { get; set; } = null!;
        public string RegionName { get; set; } = null!;
        public string ZoneName { get; set; } = null!;
    }
}
