using Implementation.Helper;
using MembershipImplementation.DTOS.Coalition;

namespace MembershipImplementation.Interfaces.Coalition;

public interface IBoardMemberService
{
    Task<ResponseMessage<List<BoardMemberDto>>> GetBoardMembersByCoalitionAsync(string coalitionId);
    Task<ResponseMessage<List<BoardMemberDto>>> GetActiveBoardMembersAsync(string coalitionId);
    Task<ResponseMessage<List<BoardMemberDto>>> GetAllBoardMembersAsync();
    Task<ResponseMessage<BoardMemberDto>> GetBoardMemberByIdAsync(string id);
    Task<ResponseMessage<string>> AddBoardMemberAsync(BoardMemberPostDto boardMemberDto);
    Task<ResponseMessage<string>> UpdateBoardMemberAsync(BoardMemberUpdateDto boardMemberDto);
    Task<ResponseMessage<string>> DeleteBoardMemberAsync(string id);
    Task<ResponseMessage<string>> ToggleBoardMemberStatusAsync(string id);
} 