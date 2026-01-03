using Implementation.Helper;
using MembershipImplementation.DTOS.Events;
using MembershipImplementation.Interfaces.Events;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Events;
using Microsoft.EntityFrameworkCore;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.Services.Events;

public class EventService : IEventService
{
    private readonly ApplicationDbContext _context;

    public EventService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ResponseMessage> CreateEvent(EventPostDto eventDto, string createdById)
    {
        try
        {
            var eventEntity = new AssociationEvent
            {
                Title = eventDto.Title,
                SubTitle = eventDto.SubTitle,
                Description = eventDto.Description,
                EventDate = eventDto.EventDate,
                EndDate = eventDto.EndDate,
                Location = eventDto.Location,
                EventType = eventDto.EventType,
                IsDonationEnabled = eventDto.IsDonationEnabled,
                TargetAmount = eventDto.TargetAmount,
                AssociationId = eventDto.AssociationId,
                CreatedById = createdById,
                IsApproved = false // Events need coalition approval
            };

            // Handle image upload
            if (eventDto.Image != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(eventDto.Image.FileName);
                var filePath = Path.Combine("wwwroot", "Events", fileName);
                
                // Ensure directory exists
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await eventDto.Image.CopyToAsync(stream);
                }
                
                eventEntity.ImagePath = $"/api/wwwroot/Events/{fileName}";
            }

            _context.AssociationEvents.Add(eventEntity);
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Event created successfully",
                Data = eventEntity.Id
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error creating event: {ex.Message}"
            };
        }
    }

    public async Task<List<EventGetDto>> GetAllEvents()
    {
        return await _context.AssociationEvents
            .Include(e => e.Association)
            .Where(e => e.RowStatus == 0)
            .OrderByDescending(e => e.CreatedDate)
            .Select(e => new EventGetDto
            {
                Id = e.Id,
                Title = e.Title,
                SubTitle = e.SubTitle,
                Description = e.Description,
                ImagePath = e.ImagePath,
                EventDate = e.EventDate,
                EndDate = e.EndDate,
                Location = e.Location,
                EventType = e.EventType,
                IsDonationEnabled = e.IsDonationEnabled,
                TargetAmount = e.TargetAmount,
                AmountCollected = e.AmountCollected,
                IsApproved = e.IsApproved,
                ApprovedDate = e.ApprovedDate,
                ApprovedById = e.ApprovedById,
                AssociationId = e.AssociationId,
                AssociationName = e.Association.Name,
                AssociationLogoPath = e.Association.LogoPath,
                CreatedDate = e.CreatedDate,
                CreatedById = e.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<List<EventGetDto>> GetEventsByAssociation(Guid associationId)
    {
        return await _context.AssociationEvents
            .Include(e => e.Association)
            .Where(e => e.AssociationId == associationId && e.RowStatus == 0)
            .OrderByDescending(e => e.CreatedDate)
            .Select(e => new EventGetDto
            {
                Id = e.Id,
                Title = e.Title,
                SubTitle = e.SubTitle,
                Description = e.Description,
                ImagePath = e.ImagePath,
                EventDate = e.EventDate,
                EndDate = e.EndDate,
                Location = e.Location,
                EventType = e.EventType,
                IsDonationEnabled = e.IsDonationEnabled,
                TargetAmount = e.TargetAmount,
                AmountCollected = e.AmountCollected,
                IsApproved = e.IsApproved,
                ApprovedDate = e.ApprovedDate,
                ApprovedById = e.ApprovedById,
                AssociationId = e.AssociationId,
                AssociationName = e.Association.Name,
                AssociationLogoPath = e.Association.LogoPath,
                CreatedDate = e.CreatedDate,
                CreatedById = e.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<List<EventGetDto>> GetApprovedEvents()
    {
        return await _context.AssociationEvents
            .Include(e => e.Association)
            .Where(e => e.IsApproved && e.RowStatus == 0)
            .OrderBy(e => e.EventDate)
            .Select(e => new EventGetDto
            {
                Id = e.Id,
                Title = e.Title,
                SubTitle = e.SubTitle,
                Description = e.Description,
                ImagePath = e.ImagePath,
                EventDate = e.EventDate,
                EndDate = e.EndDate,
                Location = e.Location,
                EventType = e.EventType,
                IsDonationEnabled = e.IsDonationEnabled,
                TargetAmount = e.TargetAmount,
                AmountCollected = e.AmountCollected,
                IsApproved = e.IsApproved,
                ApprovedDate = e.ApprovedDate,
                ApprovedById = e.ApprovedById,
                AssociationId = e.AssociationId,
                AssociationName = e.Association.Name,
                AssociationLogoPath = e.Association.LogoPath,
                CreatedDate = e.CreatedDate,
                CreatedById = e.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<EventGetDto?> GetEventById(Guid eventId)
    {
        return await _context.AssociationEvents
            .Include(e => e.Association)
            .Where(e => e.Id == eventId && e.RowStatus == 0)
            .Select(e => new EventGetDto
            {
                Id = e.Id,
                Title = e.Title,
                SubTitle = e.SubTitle,
                Description = e.Description,
                ImagePath = e.ImagePath,
                EventDate = e.EventDate,
                EndDate = e.EndDate,
                Location = e.Location,
                EventType = e.EventType,
                IsDonationEnabled = e.IsDonationEnabled,
                TargetAmount = e.TargetAmount,
                AmountCollected = e.AmountCollected,
                IsApproved = e.IsApproved,
                ApprovedDate = e.ApprovedDate,
                ApprovedById = e.ApprovedById,
                AssociationId = e.AssociationId,
                AssociationName = e.Association.Name,
                AssociationLogoPath = e.Association.LogoPath,
                CreatedDate = e.CreatedDate,
                CreatedById = e.CreatedById ?? "Unknown"
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ResponseMessage> UpdateEvent(Guid eventId, EventPostDto eventDto)
    {
        try
        {
            var eventEntity = await _context.AssociationEvents.FindAsync(eventId);
            if (eventEntity == null)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = "Event not found"
                };
            }

            eventEntity.Title = eventDto.Title;
            eventEntity.SubTitle = eventDto.SubTitle;
            eventEntity.Description = eventDto.Description;
            eventEntity.EventDate = eventDto.EventDate;
            eventEntity.EndDate = eventDto.EndDate;
            eventEntity.Location = eventDto.Location;
            eventEntity.EventType = eventDto.EventType;
            eventEntity.IsDonationEnabled = eventDto.IsDonationEnabled;
            eventEntity.TargetAmount = eventDto.TargetAmount;

            // Handle image upload if new image is provided
            if (eventDto.Image != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(eventDto.Image.FileName);
                var filePath = Path.Combine("wwwroot", "Events", fileName);
                
                Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await eventDto.Image.CopyToAsync(stream);
                }
                
                eventEntity.ImagePath = $"/api/wwwroot/Events/{fileName}";
            }

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Event updated successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error updating event: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> DeleteEvent(Guid eventId)
    {
        try
        {
            var eventEntity = await _context.AssociationEvents.FindAsync(eventId);
            if (eventEntity == null)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = "Event not found"
                };
            }

            eventEntity.RowStatus = RowStatus.INACTIVE; // Soft delete
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Event deleted successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error deleting event: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> ApproveEvent(Guid eventId, string approvedById)
    {
        try
        {
            var eventEntity = await _context.AssociationEvents.FindAsync(eventId);
            if (eventEntity == null)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = "Event not found"
                };
            }

            eventEntity.IsApproved = true;
            eventEntity.ApprovedDate = DateTime.UtcNow;
            eventEntity.ApprovedById = approvedById;

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Event approved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error approving event: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> RejectEvent(Guid eventId, string rejectedById, string? reason = null)
    {
        try
        {
            var eventEntity = await _context.AssociationEvents.FindAsync(eventId);
            if (eventEntity == null)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = "Event not found"
                };
            }

            eventEntity.RowStatus = RowStatus.INACTIVE; // Soft delete
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Event rejected successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error rejecting event: {ex.Message}"
            };
        }
    }

    public async Task<List<EventGetDto>> GetPendingApprovalEvents()
    {
        return await _context.AssociationEvents
            .Include(e => e.Association)
            .Where(e => !e.IsApproved && e.RowStatus == 0)
            .OrderByDescending(e => e.CreatedDate)
            .Select(e => new EventGetDto
            {
                Id = e.Id,
                Title = e.Title,
                SubTitle = e.SubTitle,
                Description = e.Description,
                ImagePath = e.ImagePath,
                EventDate = e.EventDate,
                EndDate = e.EndDate,
                Location = e.Location,
                EventType = e.EventType,
                IsDonationEnabled = e.IsDonationEnabled,
                TargetAmount = e.TargetAmount,
                AmountCollected = e.AmountCollected,
                IsApproved = e.IsApproved,
                ApprovedDate = e.ApprovedDate,
                ApprovedById = e.ApprovedById,
                AssociationId = e.AssociationId,
                AssociationName = e.Association.Name,
                AssociationLogoPath = e.Association.LogoPath,
                CreatedDate = e.CreatedDate,
                CreatedById = e.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<ResponseMessage> CreateEventDonation(EventDonationPostDto donationDto)
    {
        try
        {
            // If EventId is null, we need to create a dummy event for standalone donations
            Guid eventId = donationDto.EventId ?? Guid.Empty;
            
            if (eventId == Guid.Empty)
            {
                // Create a dummy event for standalone donations
                // Get the first available association ID
                var firstAssociation = await _context.Associations
                    .Where(a => a.RowStatus == 0)
                    .Select(a => a.Id)
                    .FirstOrDefaultAsync();
                
                if (firstAssociation == Guid.Empty)
                {
                    return new ResponseMessage
                    {
                        Success = false,
                        Message = "No valid association found to create standalone donations"
                    };
                }
                
                var dummyEvent = new AssociationEvent
                {
                    Title = "Standalone Donation",
                    Description = "Donation not linked to a specific event",
                    EventDate = DateTime.UtcNow,
                    Location = "N/A",
                    AssociationId = firstAssociation,
                    IsDonationEnabled = true,
                    RowStatus = 0
                };
                
                _context.AssociationEvents.Add(dummyEvent);
                await _context.SaveChangesAsync();
                eventId = dummyEvent.Id;
            }

            var donation = new EventDonation
            {
                EventId = eventId,
                DonorName = donationDto.DonorName,
                PhoneNumber = donationDto.PhoneNumber,
                Email = donationDto.Email,
                Amount = donationDto.Amount,
                MemberId = donationDto.MemberId,
                TransactionReference = Guid.NewGuid().ToString(),
                IsPaid = false,
                PaymentStatus = "Pending"
            };

            _context.EventDonations.Add(donation);
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Donation created successfully",
                Data = donation.Id
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error creating donation: {ex.Message}"
            };
        }
    }

    public async Task<List<EventDonationGetDto>> GetEventDonations(Guid eventId)
    {
        return await _context.EventDonations
            .Include(d => d.Event)
            .Include(d => d.Member)
            .Where(d => d.EventId == eventId && d.RowStatus == 0)
            .OrderByDescending(d => d.CreatedDate)
            .Select(d => new EventDonationGetDto
            {
                Id = d.Id,
                EventId = d.EventId,
                EventTitle = d.Event.Title,
                DonorName = d.DonorName,
                PhoneNumber = d.PhoneNumber,
                Email = d.Email,
                Amount = d.Amount,
                TransactionReference = d.TransactionReference,
                IsPaid = d.IsPaid,
                PaymentDate = d.PaymentDate,
                MemberId = d.MemberId,
                MemberName = d.Member != null ? d.Member.FullName : null,
                PaymentMethod = d.PaymentMethod,
                PaymentStatus = d.PaymentStatus,
                CreatedDate = d.CreatedDate
            })
            .ToListAsync();
    }

    public async Task<ResponseMessage> UpdateDonationPaymentStatus(Guid donationId, bool isPaid, string transactionReference)
    {
        try
        {
            var donation = await _context.EventDonations.FindAsync(donationId);
            if (donation == null)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = "Donation not found"
                };
            }

            donation.IsPaid = isPaid;
            donation.TransactionReference = transactionReference;
            donation.PaymentDate = isPaid ? DateTime.UtcNow : null;
            donation.PaymentStatus = isPaid ? "Completed" : "Pending";

            // Update event total if payment is completed
            if (isPaid)
            {
                var eventEntity = await _context.AssociationEvents.FindAsync(donation.EventId);
                if (eventEntity != null)
                {
                    eventEntity.AmountCollected = (eventEntity.AmountCollected ?? 0) + donation.Amount;
                }
            }

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Payment status updated successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error updating payment status: {ex.Message}"
            };
        }
    }

    public async Task<double> GetEventTotalDonations(Guid eventId)
    {
        return await _context.EventDonations
            .Where(d => d.EventId == eventId && d.IsPaid && d.RowStatus == 0)
            .SumAsync(d => d.Amount);
    }

    public async Task<object> GetEventStatistics(Guid associationId)
    {
        var events = await _context.AssociationEvents
            .Include(e => e.Donations)
            .Where(e => e.AssociationId == associationId && e.RowStatus == 0)
            .ToListAsync();

        var totalEvents = events.Count;
        var approvedEvents = events.Count(e => e.IsApproved);
        var pendingEvents = events.Count(e => !e.IsApproved);
        var totalDonations = events.Sum(e => e.AmountCollected ?? 0);
        var upcomingEvents = events.Count(e => e.EventDate > DateTime.UtcNow && e.IsApproved);

        return new
        {
            TotalEvents = totalEvents,
            ApprovedEvents = approvedEvents,
            PendingEvents = pendingEvents,
            TotalDonations = totalDonations,
            UpcomingEvents = upcomingEvents
        };
    }

    public async Task<List<EventGetDto>> GetUpcomingEvents(int days = 30)
    {
        var futureDate = DateTime.UtcNow.AddDays(days);
        
        return await _context.AssociationEvents
            .Include(e => e.Association)
            .Where(e => e.IsApproved && e.RowStatus == 0 && e.EventDate >= DateTime.UtcNow && e.EventDate <= futureDate)
            .OrderBy(e => e.EventDate)
            .Select(e => new EventGetDto
            {
                Id = e.Id,
                Title = e.Title,
                SubTitle = e.SubTitle,
                Description = e.Description,
                ImagePath = e.ImagePath,
                EventDate = e.EventDate,
                EndDate = e.EndDate,
                Location = e.Location,
                EventType = e.EventType,
                IsDonationEnabled = e.IsDonationEnabled,
                TargetAmount = e.TargetAmount,
                AmountCollected = e.AmountCollected,
                IsApproved = e.IsApproved,
                ApprovedDate = e.ApprovedDate,
                ApprovedById = e.ApprovedById,
                AssociationId = e.AssociationId,
                AssociationName = e.Association.Name,
                AssociationLogoPath = e.Association.LogoPath,
                CreatedDate = e.CreatedDate,
                CreatedById = e.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }
} 