using System.Security.Claims;
using MembershipImplementation.DTOS.Coalition;
using MembershipImplementation.Interfaces.Coalition;
using Microsoft.AspNetCore.Mvc;

namespace MembershipAPI.Controllers.Coalition;

[ApiController]
[Route("api/[controller]")]
public class CoalitionController : ControllerBase
{
    private readonly ICoalitionService _service;

    public CoalitionController(ICoalitionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CoalitionPostDto dto)
    {
        var createdById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
        var entity = await _service.CreateAsync(dto, createdById);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }
    
    [HttpPut("Update/{id}")]
    public async Task<IActionResult> Update(Guid id, [FromForm] CoalitionPostDto dto)
    {
        try
        {
            var result = await _service.UpdateAsync(id, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("Delete/{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var response = await _service.DeleteAsync(id);
            return Ok(new { Success = response });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = $"Internal error: {ex.Message}" });
        }
    }
} 