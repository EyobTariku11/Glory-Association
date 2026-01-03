using Microsoft.AspNetCore.Mvc;
using MembershipImplementation.DTOS.Configuration;
using MembershipInfrustructure.Model.Configuration;
using System.Net;

namespace MembershipAPI.Controllers.Configuration
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountryController : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(typeof(List<CountryGetDto>), (int)HttpStatusCode.OK)]
        public IActionResult GetCountries()
        {
            try
            {
                var countries = new List<CountryGetDto>
                {
                    new CountryGetDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Ethiopia",
                        CountryType = CountryType.ETHIOPIAN
                    },
                    new CountryGetDto
                    {
                        Id = Guid.NewGuid(),
                        Name = "Foreign",
                        CountryType = CountryType.FOREIGN
                    }
                };

                return Ok(countries);
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, 
                    new { message = "An error occurred while retrieving countries", error = ex.Message });
            }
        }
    }

    public class CountryGetDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public CountryType CountryType { get; set; }
    }
} 