using Microsoft.AspNetCore.Mvc;
using MembershipImplementation.Interfaces.Advertisement;
using MembershipImplementation.DTOS.Advertisement;
using System.Net;
using Microsoft.AspNetCore.Http;

namespace MembershipAPI.Controllers.Advertisement;

[ApiController]
[Route("api/[controller]")]
public class AdvertisementController : ControllerBase
{
    private readonly IAdvertisementService _advertisementService;

    public AdvertisementController(IAdvertisementService advertisementService)
    {
        _advertisementService = advertisementService;
    }

    // GET: api/Advertisement
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AdvertisementDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAllAdvertisements()
    {
        try
        {
            var advertisements = await _advertisementService.GetAllAdvertisementsAsync();
            return Ok(advertisements);
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while retrieving advertisements", error = ex.Message });
        }
    }

    // GET: api/Advertisement/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AdvertisementDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetAdvertisementById(Guid id)
    {
        try
        {
            var advertisement = await _advertisementService.GetAdvertisementByIdAsync(id);
            if (advertisement == null)
            {
                return NotFound(new { message = "Advertisement not found" });
            }

            return Ok(advertisement);
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while retrieving the advertisement", error = ex.Message });
        }
    }

    // GET: api/Advertisement/page/{pageType}
    [HttpGet("page/{pageType}")]
    [ProducesResponseType(typeof(IEnumerable<AdvertisementDisplayDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAdvertisementsByPage(string pageType)
    {
        try
        {
            var advertisements = await _advertisementService.GetActiveAdvertisementsByPageAsync(pageType);
            return Ok(advertisements);
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while retrieving page advertisements", error = ex.Message });
        }
    }

    // POST: api/Advertisement
    [HttpPost]
    [ProducesResponseType(typeof(AdvertisementDto), (int)HttpStatusCode.Created)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateAdvertisement([FromForm] AdvertisementPostDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // TODO: Get actual user from authentication context
            var createdBy = "system"; // Replace with actual user ID from JWT token
            
            var advertisement = await _advertisementService.CreateAdvertisementAsync(dto, createdBy);
            return CreatedAtAction(nameof(GetAdvertisementById), new { id = advertisement.Id }, advertisement);
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while creating the advertisement", error = ex.Message });
        }
    }

    // PUT: api/Advertisement/{id}
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AdvertisementDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> UpdateAdvertisement(Guid id, [FromForm] AdvertisementUpdateDto dto)
    {
        try
        {
            if (id != dto.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // TODO: Get actual user from authentication context
            var updatedBy = "system"; // Replace with actual user ID from JWT token
            
            var advertisement = await _advertisementService.UpdateAdvertisementAsync(dto, updatedBy);
            if (advertisement == null)
            {
                return NotFound(new { message = "Advertisement not found" });
            }

            return Ok(advertisement);
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while updating the advertisement", error = ex.Message });
        }
    }

    // DELETE: api/Advertisement/{id}
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteAdvertisement(Guid id)
    {
        try
        {
            var result = await _advertisementService.DeleteAdvertisementAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Advertisement not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while deleting the advertisement", error = ex.Message });
        }
    }

    // POST: api/Advertisement/{id}/view
    [HttpPost("{id}/view")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> IncrementViewCount(Guid id)
    {
        try
        {
            var result = await _advertisementService.IncrementViewCountAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Advertisement not found" });
            }

            return Ok(new { message = "View count incremented successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while incrementing view count", error = ex.Message });
        }
    }

    // POST: api/Advertisement/{id}/click
    [HttpPost("{id}/click")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> IncrementClickCount(Guid id)
    {
        try
        {
            var result = await _advertisementService.IncrementClickCountAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Advertisement not found" });
            }

            return Ok(new { message = "Click count incremented successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while incrementing click count", error = ex.Message });
        }
    }

    // GET: api/Advertisement/analytics
    [HttpGet("analytics")]
    [ProducesResponseType(typeof(IEnumerable<AdvertisementAnalyticsDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAnalytics()
    {
        try
        {
            var analytics = await _advertisementService.GetAdvertisementAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while retrieving analytics", error = ex.Message });
        }
    }

    // GET: api/Advertisement/debug/all
    [HttpGet("debug/all")]
    [ProducesResponseType(typeof(IEnumerable<AdvertisementDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAllAdvertisementsDebug()
    {
        try
        {
            var advertisements = await _advertisementService.GetAllAdvertisementsAsync();
            return Ok(advertisements);
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while retrieving advertisements", error = ex.Message });
        }
    }

    // GET: api/Advertisement/debug/page/{pageType}
    [HttpGet("debug/page/{pageType}")]
    [ProducesResponseType(typeof(IEnumerable<AdvertisementDisplayDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAdvertisementsByPageDebug(string pageType)
    {
        try
        {
            var advertisements = await _advertisementService.GetActiveAdvertisementsByPageAsync(pageType);
            return Ok(new { 
                pageType, 
                count = advertisements.Count(), 
                advertisements,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode((int)HttpStatusCode.InternalServerError, 
                new { message = "An error occurred while retrieving page advertisements", error = ex.Message });
        }
    }
} 