using System.Net;
using System.Security.Claims;
using Implementation.Helper;
using MembershipImplementation.DTOS.News;
using MembershipImplementation.Interfaces.News;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MembershipAPI.Controllers.News;

[ApiController]
[Route("api/[controller]")]
public class NewsController : ControllerBase
{
    private readonly INewsService _newsService;

    public NewsController(INewsService newsService)
    {
        _newsService = newsService;
    }

    // Public endpoints (no authentication required)
    [HttpGet]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAllNews()
    {
        var news = await _newsService.GetAllNews();
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "News retrieved successfully",
            Data = news
        });
    }

    [HttpGet("approved")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetApprovedNews()
    {
        var news = await _newsService.GetApprovedNews();
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "Approved news retrieved successfully",
            Data = news
        });
    }

    [HttpGet("featured")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetFeaturedNews()
    {
        var news = await _newsService.GetFeaturedNews();
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "Featured news retrieved successfully",
            Data = news
        });
    }

    [HttpGet("breaking")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetBreakingNews()
    {
        var news = await _newsService.GetBreakingNews();
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "Breaking news retrieved successfully",
            Data = news
        });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ResponseMessage<NewsGetDto>), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetNewsById(Guid id)
    {
        var news = await _newsService.GetNewsById(id);
        if (news == null)
            return NotFound();

        return Ok(new ResponseMessage<NewsGetDto>
        {
            Success = true,
            Message = "News retrieved successfully",
            Data = news
        });
    }

    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(ResponseMessage<NewsGetDto>), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetNewsBySlug(string slug)
    {
        var news = await _newsService.GetNewsBySlug(slug);
        if (news == null)
            return NotFound();

        return Ok(new ResponseMessage<NewsGetDto>
        {
            Success = true,
            Message = "News retrieved successfully",
            Data = news
        });
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> SearchNews([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("Search term is required");

        var news = await _newsService.SearchNews(q);
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "Search results retrieved successfully",
            Data = news
        });
    }

    [HttpGet("category/{category}")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetNewsByCategory(string category)
    {
        var news = await _newsService.GetNewsByCategory(category);
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "Category news retrieved successfully",
            Data = news
        });
    }

    [HttpGet("tag/{tag}")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetNewsByTag(string tag)
    {
        var news = await _newsService.GetNewsByTag(tag);
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "Tagged news retrieved successfully",
            Data = news
        });
    }

    [HttpPost("{id}/view")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> IncrementViewCount(Guid id)
    {
        var result = await _newsService.IncrementViewCount(id);
        return Ok(result);
    }

    // Association endpoints (requires Association role)
    [Authorize(Roles = "Association")]
    [HttpGet("my-news")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetMyNews()
    {
        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        var news = await _newsService.GetNewsByAssociation(assocId);
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "My news retrieved successfully",
            Data = news
        });
    }

    [Authorize(Roles = "Association")]
    [HttpPost]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.Created)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateNews([FromForm] NewsPostDto newsDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var createdById = User.FindFirstValue("userId") ?? "system";
        var associationId = User.FindFirstValue("loginId");
        
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        newsDto.AssociationId = assocId;
        var result = await _newsService.CreateNews(newsDto, createdById);
        
        if (result.Success)
            return CreatedAtAction(nameof(GetNewsById), new { id = result.Data }, result);
        
        return BadRequest(result);
    }

    [Authorize(Roles = "Association")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> UpdateNews(Guid id, [FromForm] NewsPostDto newsDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        newsDto.AssociationId = assocId;
        var result = await _newsService.UpdateNews(id, newsDto);
        
        if (result.Success)
            return Ok(result);
        
        return BadRequest(result);
    }

    [Authorize(Roles = "Association")]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> DeleteNews(Guid id)
    {
        var result = await _newsService.DeleteNews(id);
        return Ok(result);
    }

    [Authorize(Roles = "Association")]
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(ResponseMessage<object>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetNewsStatistics()
    {
        var associationId = User.FindFirstValue("loginId");
        if (string.IsNullOrEmpty(associationId) || !Guid.TryParse(associationId, out var assocId))
            return BadRequest("Invalid association ID");

        var statistics = await _newsService.GetNewsStatistics(assocId);
        return Ok(new ResponseMessage<object>
        {
            Success = true,
            Message = "News statistics retrieved successfully",
            Data = statistics
        });
    }

    // Coalition endpoints (requires Coalition role)
    [Authorize(Roles = "Coalition")]
    [HttpGet("pending")]
    [ProducesResponseType(typeof(ResponseMessage<List<NewsGetDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetPendingApprovalNews()
    {
        var news = await _newsService.GetPendingApprovalNews();
        return Ok(new ResponseMessage<List<NewsGetDto>>
        {
            Success = true,
            Message = "Pending approval news retrieved successfully",
            Data = news
        });
    }

    [Authorize(Roles = "Coalition")]
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> ApproveNews(Guid id)
    {
        var approvedById = User.FindFirstValue("userId") ?? "system";
        var result = await _newsService.ApproveNews(id, approvedById);
        return Ok(result);
    }

    [Authorize(Roles = "Coalition")]
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> RejectNews(Guid id, [FromBody] string? reason = null)
    {
        var rejectedById = User.FindFirstValue("userId") ?? "system";
        var result = await _newsService.RejectNews(id, rejectedById, reason);
        return Ok(result);
    }
} 