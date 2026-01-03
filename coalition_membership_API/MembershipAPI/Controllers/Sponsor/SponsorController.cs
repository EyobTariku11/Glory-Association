using Microsoft.AspNetCore.Mvc;
using MembershipImplementation.DTOS.Sponsor;
using MembershipImplementation.Interfaces.Sponsor;
using System.ComponentModel.DataAnnotations;

namespace MembershipAPI.Controllers.Sponsor
{
    [ApiController]
    [Route("api/[controller]")]
    public class SponsorController : ControllerBase
    {
        private readonly ISponsorService _sponsorService;

        public SponsorController(ISponsorService sponsorService)
        {
            _sponsorService = sponsorService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SponsorDto>>> GetAllSponsors()
        {
            try
            {
                var sponsors = await _sponsorService.GetAllSponsorsAsync();
                return Ok(sponsors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<SponsorDto>>> GetActiveSponsors()
        {
            try
            {
                var sponsors = await _sponsorService.GetActiveSponsorsAsync();
                return Ok(sponsors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SponsorDto>> GetSponsorById(int id)
        {
            try
            {
                var sponsor = await _sponsorService.GetSponsorByIdAsync(id);
                if (sponsor == null)
                    return NotFound($"Sponsor with ID {id} not found");

                return Ok(sponsor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<SponsorDto>> CreateSponsor([FromForm] CreateSponsorDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Additional validation
                if (string.IsNullOrWhiteSpace(createDto.Name))
                {
                    return BadRequest("Sponsor name is required");
                }

                var sponsor = await _sponsorService.CreateSponsorAsync(createDto);
                return CreatedAtAction(nameof(GetSponsorById), new { id = sponsor.Id }, sponsor);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SponsorDto>> UpdateSponsor(int id, [FromForm] UpdateSponsorDto updateDto)
        {
            try
            {
                if (id != updateDto.Id)
                    return BadRequest("ID mismatch");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Additional validation
                if (string.IsNullOrWhiteSpace(updateDto.Name))
                {
                    return BadRequest("Sponsor name is required");
                }

                var sponsor = await _sponsorService.UpdateSponsorAsync(updateDto);
                return Ok(sponsor);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSponsor(int id)
        {
            try
            {
                var result = await _sponsorService.DeleteSponsorAsync(id);
                if (!result)
                    return NotFound($"Sponsor with ID {id} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<SponsorDto>> ToggleSponsorStatus(int id, [FromBody] SponsorStatusDto statusDto)
        {
            try
            {
                var sponsor = await _sponsorService.ToggleSponsorStatusAsync(id, statusDto.IsActive);
                return Ok(sponsor);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 