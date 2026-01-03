using Implementation.Helper;
using MembershipImplementation.DTOS.Events;
using MembershipImplementation.Interfaces.Events;
using MembershipImplementation.Interfaces.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.Services.Events;

public class DonationTargetService : IDonationTargetService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DonationTargetService> _logger;
    private readonly IGeneralConfigService _generalConfig;

    public DonationTargetService(
        ApplicationDbContext context, 
        ILogger<DonationTargetService> logger,
        IGeneralConfigService generalConfig)
    {
        _context = context;
        _logger = logger;
        _generalConfig = generalConfig;
    }

    public async Task<ResponseMessage> CreateDonationTarget(DonationTargetPostDto donationTargetDto, string createdById)
    {
        try
        {
            var donationTarget = new DonationTarget
            {
                Title = donationTargetDto.Title,
                Description = donationTargetDto.Description,
                TargetAmount = donationTargetDto.TargetAmount,
                AssociationId = donationTargetDto.AssociationId,
                EventId = donationTargetDto.EventId,
                IsActive = true,
                IsApproved = false,
                CreatedDate = DateTime.UtcNow,
                CreatedById = createdById,
                RowStatus = RowStatus.ACTIVE
            };

            _context.DonationTargets.Add(donationTarget);
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Donation target created successfully",
                Data = donationTarget.Id
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error creating donation target: {ex.Message}"
            };
        }
    }

    public async Task<List<DonationTargetGetDto>> GetAllDonationTargets()
    {
        return await _context.DonationTargets
            .Include(dt => dt.Association)
            .Include(dt => dt.Event)
            .Where(dt => dt.RowStatus == 0)
            .OrderByDescending(dt => dt.CreatedDate)
            .Select(dt => new DonationTargetGetDto
            {
                Id = dt.Id,
                Title = dt.Title,
                Description = dt.Description,
                TargetAmount = dt.TargetAmount,
                AmountCollected = dt.AmountCollected,
                AssociationId = dt.AssociationId,
                AssociationName = dt.Association.Name,
                AssociationLogoPath = dt.Association.LogoPath,
                EventId = dt.EventId,
                EventTitle = dt.Event != null ? dt.Event.Title : null,
                IsActive = dt.IsActive,
                IsApproved = dt.IsApproved,
                ApprovedDate = dt.ApprovedDate,
                ApprovedById = dt.ApprovedById,
                CreatedDate = dt.CreatedDate,
                CreatedById = dt.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<List<DonationTargetGetDto>> GetDonationTargetsByAssociation(Guid associationId)
    {
        return await _context.DonationTargets
            .Include(dt => dt.Association)
            .Include(dt => dt.Event)
            .Where(dt => dt.AssociationId == associationId && dt.RowStatus == 0)
            .OrderByDescending(dt => dt.CreatedDate)
            .Select(dt => new DonationTargetGetDto
            {
                Id = dt.Id,
                Title = dt.Title,
                Description = dt.Description,
                TargetAmount = dt.TargetAmount,
                AmountCollected = dt.AmountCollected,
                AssociationId = dt.AssociationId,
                AssociationName = dt.Association.Name,
                AssociationLogoPath = dt.Association.LogoPath,
                EventId = dt.EventId,
                EventTitle = dt.Event != null ? dt.Event.Title : null,
                IsActive = dt.IsActive,
                IsApproved = dt.IsApproved,
                ApprovedDate = dt.ApprovedDate,
                ApprovedById = dt.ApprovedById,
                CreatedDate = dt.CreatedDate,
                CreatedById = dt.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<List<DonationTargetGetDto>> GetApprovedDonationTargets()
    {
        return await _context.DonationTargets
            .Include(dt => dt.Association)
            .Include(dt => dt.Event)
            .Where(dt => dt.IsApproved && dt.IsActive && dt.RowStatus == 0)
            .OrderByDescending(dt => dt.CreatedDate)
            .Select(dt => new DonationTargetGetDto
            {
                Id = dt.Id,
                Title = dt.Title,
                Description = dt.Description,
                TargetAmount = dt.TargetAmount,
                AmountCollected = dt.AmountCollected,
                AssociationId = dt.AssociationId,
                AssociationName = dt.Association.Name,
                AssociationLogoPath = dt.Association.LogoPath,
                EventId = dt.EventId,
                EventTitle = dt.Event != null ? dt.Event.Title : null,
                IsActive = dt.IsActive,
                IsApproved = dt.IsApproved,
                ApprovedDate = dt.ApprovedDate,
                ApprovedById = dt.ApprovedById,
                CreatedDate = dt.CreatedDate,
                CreatedById = dt.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<DonationTargetGetDto?> GetDonationTargetById(Guid donationTargetId)
    {
        return await _context.DonationTargets
            .Include(dt => dt.Association)
            .Include(dt => dt.Event)
            .Where(dt => dt.Id == donationTargetId && dt.RowStatus == 0)
            .Select(dt => new DonationTargetGetDto
            {
                Id = dt.Id,
                Title = dt.Title,
                Description = dt.Description,
                TargetAmount = dt.TargetAmount,
                AmountCollected = dt.AmountCollected,
                AssociationId = dt.AssociationId,
                AssociationName = dt.Association.Name,
                AssociationLogoPath = dt.Association.LogoPath,
                EventId = dt.EventId,
                EventTitle = dt.Event != null ? dt.Event.Title : null,
                IsActive = dt.IsActive,
                IsApproved = dt.IsApproved,
                ApprovedDate = dt.ApprovedDate,
                ApprovedById = dt.ApprovedById,
                CreatedDate = dt.CreatedDate,
                CreatedById = dt.CreatedById ?? "Unknown"
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ResponseMessage> UpdateDonationTarget(Guid donationTargetId, DonationTargetPostDto donationTargetDto)
    {
        try
        {
            var donationTarget = await _context.DonationTargets
                .FirstOrDefaultAsync(dt => dt.Id == donationTargetId && dt.RowStatus == 0);

            if (donationTarget == null)
                return new ResponseMessage { Success = false, Message = "Donation target not found" };

            donationTarget.Title = donationTargetDto.Title;
            donationTarget.Description = donationTargetDto.Description;
            donationTarget.TargetAmount = donationTargetDto.TargetAmount;
            donationTarget.EventId = donationTargetDto.EventId;

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Donation target updated successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error updating donation target: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> DeleteDonationTarget(Guid donationTargetId)
    {
        try
        {
            var donationTarget = await _context.DonationTargets
                .FirstOrDefaultAsync(dt => dt.Id == donationTargetId && dt.RowStatus == 0);

            if (donationTarget == null)
                return new ResponseMessage { Success = false, Message = "Donation target not found" };

            donationTarget.RowStatus = RowStatus.INACTIVE;
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Donation target deleted successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error deleting donation target: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> ApproveDonationTarget(Guid donationTargetId, string approvedById)
    {
        try
        {
            var donationTarget = await _context.DonationTargets
                .FirstOrDefaultAsync(dt => dt.Id == donationTargetId && dt.RowStatus == 0);

            if (donationTarget == null)
                return new ResponseMessage { Success = false, Message = "Donation target not found" };

            donationTarget.IsApproved = true;
            donationTarget.ApprovedDate = DateTime.UtcNow;
            donationTarget.ApprovedById = approvedById;

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Donation target approved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error approving donation target: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> RejectDonationTarget(Guid donationTargetId, string rejectedById, string? reason = null)
    {
        try
        {
            var donationTarget = await _context.DonationTargets
                .FirstOrDefaultAsync(dt => dt.Id == donationTargetId && dt.RowStatus == 0);

            if (donationTarget == null)
                return new ResponseMessage { Success = false, Message = "Donation target not found" };

            donationTarget.IsApproved = false;
            donationTarget.IsActive = false;

            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = $"Donation target rejected{(reason != null ? $": {reason}" : "")}"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error rejecting donation target: {ex.Message}"
            };
        }
    }

    public async Task<List<DonationTargetGetDto>> GetPendingApprovalDonationTargets()
    {
        return await _context.DonationTargets
            .Include(dt => dt.Association)
            .Include(dt => dt.Event)
            .Where(dt => !dt.IsApproved && dt.IsActive && dt.RowStatus == 0)
            .OrderByDescending(dt => dt.CreatedDate)
            .Select(dt => new DonationTargetGetDto
            {
                Id = dt.Id,
                Title = dt.Title,
                Description = dt.Description,
                TargetAmount = dt.TargetAmount,
                AmountCollected = dt.AmountCollected,
                AssociationId = dt.AssociationId,
                AssociationName = dt.Association.Name,
                AssociationLogoPath = dt.Association.LogoPath,
                EventId = dt.EventId,
                EventTitle = dt.Event != null ? dt.Event.Title : null,
                IsActive = dt.IsActive,
                IsApproved = dt.IsApproved,
                ApprovedDate = dt.ApprovedDate,
                ApprovedById = dt.ApprovedById,
                CreatedDate = dt.CreatedDate,
                CreatedById = dt.CreatedById ?? "Unknown"
            })
            .ToListAsync();
    }

    public async Task<ResponseMessage> CreateDonationForTarget(Guid donationTargetId, EventDonationPostDto donationDto)
    {
        try
        {
            var donationTarget = await _context.DonationTargets
                .FirstOrDefaultAsync(dt => dt.Id == donationTargetId && dt.IsApproved && dt.IsActive && dt.RowStatus == 0);

            if (donationTarget == null)
                return new ResponseMessage { Success = false, Message = "Donation target not found or not approved" };

            // If EventId is null, we need to create a dummy event for standalone donations
            Guid eventId = donationTarget.EventId ?? Guid.Empty;
            
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
                TransactionReference = donationDto.DonationReference ?? Guid.NewGuid().ToString(),
                IsPaid = false,
                MemberId = donationDto.MemberId,
                PaymentMethod = "ArifPay",
                PaymentStatus = "Pending",
                CreatedDate = DateTime.UtcNow,
                CreatedById = donationDto.MemberId?.ToString() ?? "Anonymous",
                RowStatus = RowStatus.ACTIVE
            };

            _context.EventDonations.Add(donation);

            // Store the TargetId in a custom field or use the EventId to link back to the target
            // We'll use the EventId to find the target later when payment is successful
            // DO NOT update AmountCollected here - only update when payment is successful

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

    public async Task<List<EventDonationGetDto>> GetDonationsForTarget(Guid donationTargetId)
    {
        // This would need to be implemented based on how donations are linked to targets
        // For now, returning empty list
        return new List<EventDonationGetDto>();
    }

    public async Task<double> GetDonationTargetTotalDonations(Guid donationTargetId)
    {
        var donationTarget = await _context.DonationTargets
            .FirstOrDefaultAsync(dt => dt.Id == donationTargetId && dt.RowStatus == 0);

        return donationTarget?.AmountCollected ?? 0;
    }

    public async Task<object> GetDonationTargetStatistics(Guid associationId)
    {
        var targets = await _context.DonationTargets
            .Where(dt => dt.AssociationId == associationId && dt.RowStatus == 0)
            .ToListAsync();

        var totalTargets = targets.Count;
        var approvedTargets = targets.Count(t => t.IsApproved);
        var totalTargetAmount = targets.Sum(t => t.TargetAmount);
        var totalCollected = targets.Sum(t => t.AmountCollected ?? 0);

        return new
        {
            TotalTargets = totalTargets,
            ApprovedTargets = approvedTargets,
            PendingTargets = totalTargets - approvedTargets,
            TotalTargetAmount = totalTargetAmount,
            TotalCollected = totalCollected,
            OverallProgress = totalTargetAmount > 0 ? (totalCollected / totalTargetAmount) * 100 : 0
        };
    }

    /// <summary>
    /// Gets a donation by its reference
    /// </summary>
    public async Task<EventDonation?> GetDonationByReference(string reference)
    {
        return await _context.EventDonations
            .FirstOrDefaultAsync(d => d.TransactionReference == reference);
    }

    /// <summary>
    /// Updates donation payment status and handles donation target amount collection
    /// </summary>
    public async Task<ResponseMessage> UpdateDonationPaymentStatus(string reference, string status, string? sessionId)
    {
        try
        {
            // Find the donation by reference
            var donation = await _context.EventDonations
                .FirstOrDefaultAsync(d => d.TransactionReference == reference);

            if (donation == null)
            {
                return new ResponseMessage
                {
                    Success = false,
                    Message = "Donation not found with the provided reference"
                };
            }

            // Update donation status
            donation.PaymentStatus = status;
            donation.IsPaid = status.ToLower() == "success";
            
            if (sessionId != null)
            {
                // Store ArifPay session ID if provided
                donation.TransactionReference = sessionId;
            }

            if (donation.IsPaid)
            {
                donation.PaymentDate = DateTime.UtcNow;
            }

            // Save changes to donation
            await _context.SaveChangesAsync();

            // If payment was successful, update the donation target's collected amount and send SMS
            if (donation.IsPaid)
            {
                _logger.LogInformation("Payment successful for donation {DonationId}, updating donation target amount collected", donation.Id);
                
                // Find the donation target by looking for targets that have this event ID
                // Since we're using EventDonations, we need to find the target through the event
                var donationTarget = await _context.DonationTargets
                    .FirstOrDefaultAsync(dt => dt.EventId == donation.EventId);

                if (donationTarget != null)
                {
                    var previousAmount = donationTarget.AmountCollected ?? 0;
                    var newAmount = previousAmount + donation.Amount;
                    
                    // Update the collected amount
                    donationTarget.AmountCollected = newAmount;
                    
                    _logger.LogInformation("Donation target {TargetId} updated: Amount collected increased from {Previous} to {New} (added {Amount})",
                        donationTarget.Id, previousAmount, newAmount, donation.Amount);
                }
                else
                {
                    _logger.LogWarning("No donation target found for EventId {EventId} when updating amount collected for donation {DonationId}",
                        donation.EventId, donation.Id);
                }

                // Send SMS notification for successful donation
                await SendDonationSuccessSMS(donation);
            }
            else
            {
                _logger.LogInformation("Payment not successful (status: {Status}), skipping donation target amount update for donation {DonationId}",
                    status, donation.Id);
            }

            // Save all changes (both donation and donation target updates)
            await _context.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = $"Donation payment status updated to {status}",
                Data = new
                {
                    DonationId = donation.Id,
                    Status = donation.PaymentStatus,
                    IsPaid = donation.IsPaid,
                    PaymentDate = donation.PaymentDate,
                    AmountCollected = donation.IsPaid ? "Updated" : "Not applicable"
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating donation payment status: Reference={Reference}, Status={Status}",
                reference, status);
            
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error updating donation payment status: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Sends SMS notification for successful donation
    /// </summary>
    private async Task SendDonationSuccessSMS(EventDonation donation)
    {
        try
        {
            if (string.IsNullOrEmpty(donation.PhoneNumber))
            {
                _logger.LogWarning("No phone number available for donation {DonationId}, skipping SMS", donation.Id);
                return;
            }

            // English message
            var messageEn = $"Congratulations!\n" +
                           $"We are delighted to confirm that we have received your payment of {donation.Amount:C} ETB. " +
                           $"Thank you for your generous donation to the EPLFFC Association.\n\n" +
                           $"You can visit our site https://abizeermembership.com for more information.\n\n" +
                           $"We truly appreciate your support.";

            // Amharic message
            var messageAm = $"እንኳን ደስ አለዎት!\n" +
                           $"ክፍያዎት ደርሶናል። ለአቢ-ዝር ማህበር ያደረጉት የ{donation.Amount:C} ETB በጎ መዋጮ እናመሰግናለን።\n\n" +
                           $"ለበለጠ መረጃ እባኮትን ድህረ ገፃችንን በ https://abizeermembership.com ይጎብኙ።\n\n" +
                           $"ድጋፍህን ከልብ እናመሰግናለን።";

            // Send both messages
            var messageRequestEn = new MessageRequest
            {
                PhoneNumber = donation.PhoneNumber,
                Message = messageEn
            };

            var messageRequestAm = new MessageRequest
            {
                PhoneNumber = donation.PhoneNumber,
                Message = messageAm
            };

            // Send SMS notifications
            await _generalConfig.SendMessage(messageRequestEn);
            await _generalConfig.SendMessage(messageRequestAm);

            _logger.LogInformation("SMS notifications sent successfully for donation {DonationId} to {PhoneNumber}", 
                donation.Id, donation.PhoneNumber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS notification for donation {DonationId}", donation.Id);
            // Don't throw here - SMS failure shouldn't break the payment process
        }
    }
} 