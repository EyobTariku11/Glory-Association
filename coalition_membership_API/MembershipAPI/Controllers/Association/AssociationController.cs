using System.Net;
using System.Security.Claims;
using Implementation.DTOS.Authentication;
using Implementation.Helper;
using MembershipImplementation.DTOS.Association;
using MembershipImplementation.Interfaces.Association;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MembershipAPI.Controllers.Association;


[ApiController]
[Route("api/[controller]")]
public class AssociationController : ControllerBase
{
    private readonly IAssociationService _service;

    public AssociationController(IAssociationService service)
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
    
    [HttpGet("MembershipTypeId/{id}")]
    public async Task<IActionResult> GetByMembershipType(Guid id)
    {
        var result = await _service.GetByMembershipType(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    
    

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] AssociationPostDto dto)
    {
        var createdById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system"; // adjust based on auth
        var entity = await _service.CreateAsync(dto, createdById);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }
    
    [HttpPut("Update/{id}")]
    public async Task<IActionResult> Update(Guid id, [FromForm] AssociationPostDto dto)
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
            // if (!response.Success)
            //     return BadRequest(response);

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseMessage
            {
                Success = false,
                Message = $"Internal error: {ex.Message}"
            });
        }
    }
    
    [HttpPost("Add_User")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> AddUser([FromBody] AddUSerDto addUSer)
    {
        if (ModelState.IsValid)
        {
            return Ok(await _service.AddUser(addUSer));
        }
        else
        {
            return BadRequest();
        }
    }
    
    
    
    [HttpPut("UpdateUser/{userId}")]
    public async Task<IActionResult> UpdateUser(string userId, [FromBody] AddUSerDto dto)
    {
        if (dto == null)
            return BadRequest(new ResponseMessage { Success = false, Message = "Invalid user data." });

        try
        {
            var result = await _service.UpdateUserAsync(userId, dto);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseMessage
            {
                Success = false,
                Message = $"Internal server error: {ex.Message}"
            });
        }
    }
    
    [HttpGet("Get_Users")]
    [ProducesResponseType(typeof(UserListDto), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetUserList(Guid associationId)
    {
        return Ok(await _service.GetUserList(associationId));
    }

    
    [HttpGet("GetAssociationDropDown")]
    public async Task<IActionResult> GetAssociationDropDown()
    {
        var result = await _service.GetAssociationDropDown();
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("GetAssociationsWithMemberCount")]
    public async Task<IActionResult> GetAssociationsWithMemberCount()
    {
        var result = await _service.GetAssociationsWithMemberCountAsync();
        return Ok(result);
    }

    [HttpGet("GetArifPayKey/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetArifPayKey(Guid id)
    {
        try
        {
            var result = await _service.GetArifPayKeyAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ResponseMessage
            {
                Success = false,
                Message = $"Internal error: {ex.Message}"
            });
        }
    }

    [HttpDelete("DeleteUser/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var result = await _service.DeleteUserAsync(userId);
        if (result.Success)
            return Ok(result);

        return BadRequest(result);
    }
}

