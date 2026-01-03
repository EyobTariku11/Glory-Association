using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MembershipImplementation.DTOS.Coalition;
using MembershipImplementation.Interfaces.Coalition;
using Implementation.Helper;

namespace MembershipAPI.Controllers.Coalition;

[Route("api/[controller]/[action]")]
[ApiController]

public class BoardMemberController : ControllerBase
{
    private readonly IBoardMemberService _boardMemberService;

    public BoardMemberController(IBoardMemberService boardMemberService)
    {
        _boardMemberService = boardMemberService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<BoardMemberDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetBoardMembersByCoalition(string coalitionId)
    {
        if (string.IsNullOrEmpty(coalitionId))
        {
            return BadRequest("Coalition ID is required");
        }

        var result = await _boardMemberService.GetBoardMembersByCoalitionAsync(coalitionId);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<BoardMemberDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetActiveBoardMembers(string coalitionId)
    {
        if (string.IsNullOrEmpty(coalitionId))
        {
            return BadRequest("Coalition ID is required");
        }

        var result = await _boardMemberService.GetActiveBoardMembersAsync(coalitionId);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<BoardMemberDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAllBoardMembers()
    {
        var result = await _boardMemberService.GetAllBoardMembersAsync();
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(BoardMemberDto), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetBoardMemberById(string id)
    {
        if (string.IsNullOrEmpty(id))
        {
            return BadRequest("Board member ID is required");
        }

        var result = await _boardMemberService.GetBoardMemberByIdAsync(id);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return NotFound(result);
    }

    [HttpPost]
    public async Task<ActionResult<ResponseMessage<string>>> AddBoardMember([FromForm] BoardMemberPostDto boardMemberDto)
    {
        var result = await _boardMemberService.AddBoardMemberAsync(boardMemberDto);
        
        if (result.Success)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    
 
    [HttpPut]
    public async Task<ActionResult<ResponseMessage<string>>> UpdateBoardMember([FromForm] BoardMemberUpdateDto boardMemberDto)
    {
        var result = await _boardMemberService.UpdateBoardMemberAsync(boardMemberDto);
        
        if (result.Success)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

  
    [HttpDelete]
    [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
   
    public async Task<IActionResult> DeleteBoardMember(string id)
    {
        if (string.IsNullOrEmpty(id))
        {
            return BadRequest("Board member ID is required");
        }

        var result = await _boardMemberService.DeleteBoardMemberAsync(id);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    
    [HttpPost]
    [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
    
    public async Task<IActionResult> ToggleBoardMemberStatus(string id)
    {
        if (string.IsNullOrEmpty(id))
        {
            return BadRequest("Board member ID is required");
        }

        var result = await _boardMemberService.ToggleBoardMemberStatusAsync(id);
        
        if (result.Success)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }
} 