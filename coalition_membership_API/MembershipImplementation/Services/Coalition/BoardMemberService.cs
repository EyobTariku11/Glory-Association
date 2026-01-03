using AutoMapper;
using Implementation.Helper;
using MembershipImplementation.DTOS.Coalition;
using MembershipImplementation.Interfaces.Coalition;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Coalition;
using Microsoft.EntityFrameworkCore;

namespace MembershipImplementation.Services.Coalition;

public class BoardMemberService : IBoardMemberService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public BoardMemberService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ResponseMessage<List<BoardMemberDto>>> GetBoardMembersByCoalitionAsync(string coalitionId)
    {
        try
        {
            if (!Guid.TryParse(coalitionId, out Guid coalitionGuid))
            {
                return new ResponseMessage<List<BoardMemberDto>>
                {
                    Success = false,
                    Message = "Invalid coalition ID format"
                };
            }

            var boardMembers = await _context.BoardMembers
                .Where(bm => bm.CoalitionId == coalitionGuid)
                .OrderBy(bm => bm.StartDate)
                .ToListAsync();

            var boardMemberDtos = _mapper.Map<List<BoardMemberDto>>(boardMembers);

            return new ResponseMessage<List<BoardMemberDto>>
            {
                Success = true,
                Data = boardMemberDtos,
                Message = "Board members retrieved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<List<BoardMemberDto>>
            {
                Success = false,
                Message = $"Error retrieving board members: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage<List<BoardMemberDto>>> GetActiveBoardMembersAsync(string coalitionId)
    {
        try
        {
            if (!Guid.TryParse(coalitionId, out Guid coalitionGuid))
            {
                return new ResponseMessage<List<BoardMemberDto>>
                {
                    Success = false,
                    Message = "Invalid coalition ID format"
                };
            }

            var boardMembers = await _context.BoardMembers
                .Where(bm => bm.CoalitionId == coalitionGuid && bm.IsActive)
                .OrderBy(bm => bm.StartDate)
                .ToListAsync();

            var boardMemberDtos = _mapper.Map<List<BoardMemberDto>>(boardMembers);

            return new ResponseMessage<List<BoardMemberDto>>
            {
                Success = true,
                Data = boardMemberDtos,
                Message = "Active board members retrieved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<List<BoardMemberDto>>
            {
                Success = false,
                Message = $"Error retrieving active board members: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage<List<BoardMemberDto>>> GetAllBoardMembersAsync()
    {
        try
        {
            var boardMembers = await _context.BoardMembers
                .Where(bm => bm.IsActive)
                .OrderBy(bm => bm.StartDate)
                .ToListAsync();

            var boardMemberDtos = _mapper.Map<List<BoardMemberDto>>(boardMembers);

            return new ResponseMessage<List<BoardMemberDto>>
            {
                Success = true,
                Data = boardMemberDtos,
                Message = "All board members retrieved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<List<BoardMemberDto>>
            {
                Success = false,
                Message = $"Error retrieving board members: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage<BoardMemberDto>> GetBoardMemberByIdAsync(string id)
    {
        try
        {
            var boardMember = await _context.BoardMembers
                .FirstOrDefaultAsync(bm => bm.Id.ToString() == id);

            if (boardMember == null)
            {
                return new ResponseMessage<BoardMemberDto>
                {
                    Success = false,
                    Message = "Board member not found"
                };
            }

            var boardMemberDto = _mapper.Map<BoardMemberDto>(boardMember);

            return new ResponseMessage<BoardMemberDto>
            {
                Success = true,
                Data = boardMemberDto,
                Message = "Board member retrieved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<BoardMemberDto>
            {
                Success = false,
                Message = $"Error retrieving board member: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage<string>> AddBoardMemberAsync(BoardMemberPostDto boardMemberDto)
    {
        try
        {
            var boardMember = new BoardMember
            {
                FullName = boardMemberDto.FullName,
                Description = boardMemberDto.Description,
                StartDate = boardMemberDto.StartDate,
                Position = boardMemberDto.Position,
                CoalitionId = boardMemberDto.CoalitionId,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            // Handle photo upload
            if (boardMemberDto.Photo != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(boardMemberDto.Photo.FileName);
                var filePath = Path.Combine("wwwroot", "BoardMembers", fileName);

                // Ensure directory exists
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await boardMemberDto.Photo.CopyToAsync(stream);
                }

                boardMember.PhotoPath = $"/wwwroot/BoardMembers/{fileName}";
            }

            _context.BoardMembers.Add(boardMember);
            await _context.SaveChangesAsync();

            return new ResponseMessage<string>
            {
                Success = true,
                Message = "Board member added successfully",
                Data = boardMember.Id.ToString()
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<string>
            {
                Success = false,
                Message = $"Error adding board member: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage<string>> UpdateBoardMemberAsync(BoardMemberUpdateDto boardMemberDto)
    {
        try
        {
            var boardMember = await _context.BoardMembers.FindAsync(Guid.Parse(boardMemberDto.Id));
            if (boardMember == null)
            {
                return new ResponseMessage<string>
                {
                    Success = false,
                    Message = "Board member not found"
                };
            }

            boardMember.FullName = boardMemberDto.FullName;
            boardMember.Description = boardMemberDto.Description;
            boardMember.StartDate = boardMemberDto.StartDate;
            boardMember.Position = boardMemberDto.Position;
            boardMember.IsActive = boardMemberDto.IsActive;
            boardMember.UpdatedDate = DateTime.UtcNow;

            // Handle photo upload if new photo is provided
            if (boardMemberDto.Photo != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(boardMemberDto.Photo.FileName);
                var filePath = Path.Combine("wwwroot", "BoardMembers", fileName);

                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await boardMemberDto.Photo.CopyToAsync(stream);
                }

                boardMember.PhotoPath = $"/wwwroot/BoardMembers/{fileName}";
            }

            await _context.SaveChangesAsync();

            return new ResponseMessage<string>
            {
                Success = true,
                Message = "Board member updated successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<string>
            {
                Success = false,
                Message = $"Error updating board member: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage<string>> DeleteBoardMemberAsync(string id)
    {
        try
        {
            var boardMember = await _context.BoardMembers
                .FirstOrDefaultAsync(bm => bm.Id.ToString() == id);

            if (boardMember == null)
            {
                return new ResponseMessage<string>
                {
                    Success = false,
                    Message = "Board member not found"
                };
            }

            _context.BoardMembers.Remove(boardMember);
            await _context.SaveChangesAsync();

            return new ResponseMessage<string>
            {
                Success = true,
                Data = id,
                Message = "Board member deleted successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<string>
            {
                Success = false,
                Message = $"Error deleting board member: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage<string>> ToggleBoardMemberStatusAsync(string id)
    {
        try
        {
            var boardMember = await _context.BoardMembers
                .FirstOrDefaultAsync(bm => bm.Id.ToString() == id);

            if (boardMember == null)
            {
                return new ResponseMessage<string>
                {
                    Success = false,
                    Message = "Board member not found"
                };
            }

            boardMember.IsActive = !boardMember.IsActive;
            boardMember.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var status = boardMember.IsActive ? "activated" : "deactivated";
            return new ResponseMessage<string>
            {
                Success = true,
                Data = id,
                Message = $"Board member {status} successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage<string>
            {
                Success = false,
                Message = $"Error toggling board member status: {ex.Message}"
            };
        }
    }
} 