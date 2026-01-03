using MembershipInfrustructure.Model.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipInfrustructure.Model.Configuration
{
    public class Region : WithIdModel
    {
        public string RegionName { get; set; } = null!;

        public CountryType CountryType { get; set; }


    }

    public enum CountryType
    {
        ETHIOPIAN,
        FOREIGN
    } 

}
