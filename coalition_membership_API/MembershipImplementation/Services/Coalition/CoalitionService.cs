using MembershipImplementation.DTOS.Coalition;
using MembershipImplementation.Interfaces.Coalition;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Coalition;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace MembershipImplementation.Services.Coalition;

public class CoalitionService : ICoalitionService
{
    private readonly ApplicationDbContext _context;

    public CoalitionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CoalitionGetDto> CreateAsync(CoalitionPostDto dto, string createdById)
    {
        var entity = new CoalitionModel
        {
            Name = dto.Name,
            AmharicName = dto.AmharicName,
            ArifPayKey = dto.ArifPayKey,
            Email = dto.Email,
            PhoneNumbers = dto.PhoneNumbers.ToArray(),
            Description = dto.Description,
            About = dto.About,
            Facebook = dto.Facebook,
            Telegram = dto.Telegram,
            TikTok = dto.TikTok,
            CreatedById = createdById,
            CreatedDate = DateTime.UtcNow
        };

        if (dto.Logo != null)
        {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Logo.FileName);
            var filePath = Path.Combine("wwwroot", "uploads", "coalition", fileName);
            
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Logo.CopyToAsync(stream);
            }
            
            entity.LogoPath = Path.Combine("uploads", "coalition", fileName);
        }

        _context.Coalition.Add(entity);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(entity.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _context.Coalition.FindAsync(id);
        if (entity == null) return false;

        _context.Coalition.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<CoalitionGetDto>> GetAllAsync()
    {
        var entities = await _context.Coalition
            .Where(c => c.RowStatus == MembershipInfrustructure.Data.EnumList.RowStatus.ACTIVE)
            .ToListAsync();

        return entities.Select(MapToDto).ToList();
    }

    public async Task<CoalitionGetDto> GetByIdAsync(Guid id)
    {
        var entity = await _context.Coalition.FindAsync(id);
        return entity != null ? MapToDto(entity) : null!;
    }

    public async Task<CoalitionGetDto> UpdateAsync(Guid id, CoalitionPostDto dto)
    {
        var entity = await _context.Coalition.FindAsync(id);
        if (entity == null) throw new ArgumentException("Coalition not found");

        entity.Name = dto.Name;
        entity.AmharicName = dto.AmharicName;
        entity.ArifPayKey = dto.ArifPayKey;
        entity.Email = dto.Email;
        entity.PhoneNumbers = dto.PhoneNumbers.ToArray();
        entity.Description = dto.Description;
        entity.About = dto.About;
        entity.Facebook = dto.Facebook;
        entity.Telegram = dto.Telegram;
        entity.TikTok = dto.TikTok;
        // UpdatedDate is not available in the base model

        if (dto.Logo != null)
        {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Logo.FileName);
            var filePath = Path.Combine("wwwroot", "uploads", "coalition", fileName);
            
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Logo.CopyToAsync(stream);
            }
            
            entity.LogoPath = Path.Combine("uploads", "coalition", fileName);
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    private static CoalitionGetDto MapToDto(CoalitionModel entity)
    {
        return new CoalitionGetDto
        {
            Id = entity.Id,
            Name = entity.Name,
            ArifPayKey = entity.ArifPayKey,
            AmharicName = entity.AmharicName,
            Email = entity.Email,
            LogoPath = entity.LogoPath,
            PhoneNumbers = entity.PhoneNumbers.ToList(),
            Description = entity.Description,
            About = entity.About,
            Facebook = entity.Facebook,
            Telegram = entity.Telegram,
            TikTok = entity.TikTok,
            CreatedDate = entity.CreatedDate
        };
    }
} 