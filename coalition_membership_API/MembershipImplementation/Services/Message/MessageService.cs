using Implementation.Helper;
using MembershipImplementation.DTOS.Configuration;
using MembershipImplementation.DTOS.EventMessage;
using MembershipImplementation.Helper;
using MembershipImplementation.Interfaces.Configuration;
using MembershipImplementation.Interfaces.Message;
using MembershipImplementation.Interfaces.Telegram;
using MembershipImplementation.Services.Configuration;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Configuration;
using MembershipInfrustructure.Model.Message;
using Microsoft.EntityFrameworkCore;

namespace MembershipImplementation.Services.Message;

public class EventMessageService : IEventMessageService
{
    
    public readonly ApplicationDbContext _dbContext;

    private readonly IEmailService _emailService;
    private readonly ITelegramService _telegramService;

    private readonly IGeneralConfigService _generalConfig;

    public EventMessageService(
        ApplicationDbContext dbContext, 
        IEmailService emailService,
        IGeneralConfigService generalConfig,
        ITelegramService telegramService)
    {
        _dbContext = dbContext;
        _emailService = emailService;
        _generalConfig = generalConfig; 
        _telegramService = telegramService;
    }

    public async Task<ResponseMessage<string>> AddEventMessage(EventMessagePostDto eventMessagePost, Guid associationId)
    {
        try
        {
            var eventMessage = new MembershipInfrustructure.Model.Message.Message
            {
                Id = Guid.NewGuid(),
                CreatedDate = DateTime.UtcNow,
                MessageTypes = eventMessagePost.MessageTypes,
                Content = eventMessagePost.Content,
                IsApproved = false,
                AssociationId = associationId,
                RowStatus = EnumList.RowStatus.ACTIVE
            };

            await _dbContext.Messages.AddAsync(eventMessage);
            await _dbContext.SaveChangesAsync();
            
            
            
            
          
            
            
            
            

            return new ResponseMessage<string>
            {
                Success = true,
                Message = "Message created successfully!",
                Data = eventMessage.Id.ToString()
            };
        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException<string>(ex);
        }
    }


    public async Task<ResponseMessage<string>> UpdateEventMessage(EventMessageGetDto eventMessageGetDto, Guid? associationId = null)
    {
        try
        {
            var eventMessage = await _dbContext.Messages
                .FirstOrDefaultAsync(x => x.Id == eventMessageGetDto.MessageId);

            if (eventMessage == null)
            {
                return new ResponseMessage<string>
                {
                    Success = false,
                    Message = "Event Message not found!"
                };
            }

            // Check if association user is trying to update their own message
            if (associationId.HasValue && eventMessage.AssociationId != associationId.Value)
            {
                return new ResponseMessage<string>
                {
                    Success = false,
                    Message = "You do not have permission to update this message!"
                };
            }

            if (eventMessage.IsApproved)
            {
                return new ResponseMessage<string>
                {
                    Success = false,
                    Message = "Message already approved!"
                };
            }

            // Update only if needed
            eventMessage.Content = eventMessageGetDto.Content;
            eventMessage.IsApproved = eventMessageGetDto.IsApproved;
            eventMessage.MessageTypes = eventMessageGetDto.MessageTypes;

            await _dbContext.SaveChangesAsync();

            return new ResponseMessage<string>
            {
                Success = true,
                Message = "Message updated successfully!"
            };
        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException<string>(ex);
        }
    }

    public async Task<ResponseMessage<List<EventMessageGetDto>>> GetEventMessage(bool isApproved, Guid? associationId = null)
    {
        try
        {
            var query = _dbContext.Messages
                .AsNoTracking()
                .Where(x => x.IsApproved == isApproved);

            // Filter by association ID if provided (for Association users)
            if (associationId.HasValue)
            {
                query = query.Where(x => x.AssociationId == associationId.Value);
            }

            var eventMessages = await query
                .Select(x => new EventMessageGetDto
                {
                    MessageId = x.Id,
                    MessageTypeGet = string.Join(", ", x.MessageTypes),
                    MessageTypes = x.MessageTypes,
                    Content = x.Content,
                    IsApproved = x.IsApproved
                })
                .ToListAsync();

            return new ResponseMessage<List<EventMessageGetDto>>
            {
                Success = true,
                Message = "Event messages retrieved successfully!",
                Data = eventMessages
            };
        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException<List<EventMessageGetDto>>(ex);
        }
    }


   public async Task<ResponseMessage<string>> AddEventMessageMember(EventMessageMemberPostDto eventMessageMemberPost, Guid? associationId = null)
{
    try
    {
        // Get the message to retrieve its AssociationId
        var message = await _dbContext.Messages
            .FirstOrDefaultAsync(x => x.Id == eventMessageMemberPost.EventMessageId);

        if (message == null)
        {
            return new ResponseMessage<string>
            {
                Success = false,
                Message = "Message not found!"
            };
        }

        // Check if association user is trying to add members to their own message
        if (associationId.HasValue && message.AssociationId != associationId.Value)
        {
            return new ResponseMessage<string>
            {
                Success = false,
                Message = "You do not have permission to add members to this message!"
            };
        }

        var messageAssociationId = message.AssociationId;
        var isCoalitionUser = !associationId.HasValue; // Coalition users don't have associationId
        var eventMessageMembers = new List<MessageMember>();

        // If ForAllMembers is true
        if (eventMessageMemberPost.ForAllMembers)
        {
            if (isCoalitionUser)
            {
                // Coalition users: Get ALL members from ALL associations
                eventMessageMembers = await _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Select(member => new MessageMember
                    {
                        Id = Guid.NewGuid(),
                        CreatedDate = DateTime.UtcNow,
                        MessageStatus = MessageStatus.Pending,
                        MessageId = eventMessageMemberPost.EventMessageId,
                        MemberId = member.Id,
                        RowStatus = EnumList.RowStatus.ACTIVE
                    })
                    .ToListAsync();
            }
            else
            {
                // Association users: Get only members from their association
                eventMessageMembers = await _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Where(member => member.MembershipType.AssociationId == messageAssociationId)
                    .Select(member => new MessageMember
                    {
                        Id = Guid.NewGuid(),
                        CreatedDate = DateTime.UtcNow,
                        MessageStatus = MessageStatus.Pending,
                        MessageId = eventMessageMemberPost.EventMessageId,
                        MemberId = member.Id,
                        RowStatus = EnumList.RowStatus.ACTIVE
                    })
                    .ToListAsync();
            }
        }
        else
        {
            // Add members by MemberIds
            if (eventMessageMemberPost.MemberIds != null && eventMessageMemberPost.MemberIds.Any())
            {
                var query = _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Where(member => eventMessageMemberPost.MemberIds.Contains(member.Id));

                // Filter by association only for Association users
                if (!isCoalitionUser)
                {
                    query = query.Where(member => member.MembershipType.AssociationId == messageAssociationId);
                }

                var membersToAdd = await query
                    .Select(member => new MessageMember
                    {
                        Id = Guid.NewGuid(),
                        CreatedDate = DateTime.UtcNow,
                        MessageStatus = MessageStatus.Pending,
                        MessageId = eventMessageMemberPost.EventMessageId,
                        MemberId = member.Id,
                        RowStatus = EnumList.RowStatus.ACTIVE
                    })
                    .ToListAsync();

                eventMessageMembers.AddRange(membersToAdd);
            }

            // Add members by MembershipIds
            if (eventMessageMemberPost.MembershipIds != null && eventMessageMemberPost.MembershipIds.Any())
            {
                var query = _dbContext.Members
                    .Include(m => m.MembershipType)
                    .Where(member => eventMessageMemberPost.MembershipIds.Contains(member.MembershipTypeId));

                // Filter by association only for Association users
                if (!isCoalitionUser)
                {
                    query = query.Where(member => member.MembershipType.AssociationId == messageAssociationId);
                }

                var membersByMembership = await query
                    .Select(member => new MessageMember
                    {
                        Id = Guid.NewGuid(),
                        CreatedDate = DateTime.UtcNow,
                        MessageStatus = MessageStatus.Pending,
                        MessageId = eventMessageMemberPost.EventMessageId,
                        MemberId = member.Id,
                        RowStatus = EnumList.RowStatus.ACTIVE
                    })
                    .ToListAsync();

                eventMessageMembers.AddRange(membersByMembership);
            }
        }

        // Save event message members if any
        if (eventMessageMembers.Any())
        {
            await _dbContext.MessageMembers.AddRangeAsync(eventMessageMembers);
            await _dbContext.SaveChangesAsync();
        }

        return new ResponseMessage<string>
        {
            Success = true,
            Message = "Member messages added successfully!"
        };
    }
    catch (Exception ex)
    {
        return ExceptionHandler.HandleException<string>(ex);
    }
}

    public async Task<ResponseMessage<List<EventMessageMemberGetDto>>> GetEventMessageMember(MessageStatus? messageStatus, Guid? eventMessageId)
    {
        try
        {
            var query = _dbContext.MessageMembers
                .AsNoTracking()
                .Include(x => x.Member)
                .Include(x => x.Message)
                .Where(x => x.MessageStatus == messageStatus);

            if (eventMessageId.HasValue)
            {
                query = query.Where(x => x.MessageId == eventMessageId.Value);
            }

            var eventMessageMembers = await query
                .Select(x => new EventMessageMemberGetDto
                {
                    EventMessageId = x.MessageId,
                    EventMessageMemberId = x.Id.ToString(),
                    MessageStatus = x.MessageStatus,
                    MessageContent = x.Message.Content,
                    MemberName = x.Member.FullName,
                    MemberPhoneNumber = x.Member.PhoneNumber,
                    MessageStatusGet = x.MessageStatus.ToString(),
                })
                .ToListAsync();

            return new ResponseMessage<List<EventMessageMemberGetDto>>
            {
                Success = true,
                Message = "Members message retrieved successfully!",
                Data = eventMessageMembers
            };
        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException<List<EventMessageMemberGetDto>>(ex);
        }
    }


    public async Task<ResponseMessage<string>> ChangeMessageStatus(List<Guid> memberMessageIds)
{
    try
    {
        // Fetch all required member messages in a single query
        var memberMessages = await _dbContext.MessageMembers
            .Where(x => memberMessageIds.Contains(x.Id))
            .Include(x => x.Member.Region)
            .Include(x => x.Message)
            .ToListAsync();

        // Filter out any null values
        memberMessages = memberMessages.Where(mm => mm != null && mm.Message != null && mm.Member != null).ToList();

        // Reload messages to ensure MessageTypes are properly loaded
        var messageIds = memberMessages.Select(mm => mm.MessageId).Distinct().ToList();
        var messages = await _dbContext.Messages
            .Where(m => messageIds.Contains(m.Id))
            .ToListAsync();

        // Create a dictionary for quick lookup
        var messageDict = messages.ToDictionary(m => m.Id);

        // Update Message references to ensure MessageTypes are loaded
        foreach (var memberMessage in memberMessages)
        {
            if (messageDict.ContainsKey(memberMessage.MessageId))
            {
                memberMessage.Message = messageDict[memberMessage.MessageId];
            }
        }

        if (!memberMessages.Any())
        {
            return new ResponseMessage<string>
            {
                Success = false,
                Message = "No valid member messages found to send."
            };
        }

        // Parallel tasks for sending emails and messages
        var emailTasks = new List<Task>();
        var messageTasks = new List<Task>();
        var telegramTasks = new List<Task>();
        var whatsAppTasks = new List<Task>();
        
        foreach (var memberMessage in memberMessages)
        {
            // Validate that Message and MessageTypes are not null
            if (memberMessage.Message == null)
            {
                continue;
            }

            // Ensure MessageTypes is not null or empty
            if (memberMessage.Message.MessageTypes == null || !memberMessage.Message.MessageTypes.Any())
            {
                // Log warning but continue processing other messages
                continue;
            }

            var message = $"ሰላም {memberMessage.Member.FullName} {memberMessage.Message.Content}";
        
            if (memberMessage.Message.MessageTypes.Contains(MessageType.Email))
            {
                if (!string.IsNullOrEmpty(memberMessage.Member.Email))
                {
                    var email = new EmailMetadata(
                        memberMessage.Member.Email,
                        "EPLFFC",
                        $"{message}\nThank you.\n\nSincerely,\n\nExecutive Director"
                    );
                    emailTasks.Add(_emailService.Send(email));
                }
            }
        
            if (memberMessage.Message.MessageTypes.Contains(MessageType.SMS))
            {
                if (!string.IsNullOrEmpty(memberMessage.Member.PhoneNumber))
                {
                    try
                    {
                        var messageRequest = new MessageRequest
                        {
                            PhoneNumber = memberMessage.Member.PhoneNumber,
                            Message = message
                        };
                        messageTasks.Add(_generalConfig.SendMessage(messageRequest));
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue processing other messages
                        // The error will be caught when awaiting tasks
                    }
                }
            }

            if (memberMessage.Message.MessageTypes.Contains(MessageType.Telegram))
            {
                if (!string.IsNullOrEmpty(memberMessage.Member.ChatId))
                {
                    telegramTasks.Add(_telegramService.SendMessageAsync(memberMessage.Member.ChatId, message));
                }
            }
            
            
            // if (memberMessage.EventMessage.MessageTypes.Contains(MessageType.WhatsApp))
            // {
            //     if (memberMessage.Member.PhoneNumber != null )
            //     {
            //         var MessageRequest = new MessageRequest
            //         {
            //             PhoneNumber = memberMessage.Member.PhoneNumber,
            //             Message = message,
            //             Country =memberMessage.Member.Region.CountryType!=CountryType.ETHIOPIAN? memberMessage.Member.Region.RegionName:"Ethiopia"
            //             
            //         };
            //         whatsAppTasks.Add(_generalConfig.SendWhatsAppMessage(MessageRequest));
            //     }
            // }

            // Update status in-memory, bulk save will happen outside the loop
           memberMessage.MessageStatus = MessageStatus.Sent;
        }

        // Await all email and message tasks concurrently with error handling
        try
        {
            await Task.WhenAll(emailTasks);
        }
        catch (Exception ex)
        {
            // Log email errors but continue
        }

        var smsErrors = new List<string>();
        var smsTasksWithErrorHandling = messageTasks.Select(async task =>
        {
            try
            {
                await task;
            }
            catch (Exception ex)
            {
                smsErrors.Add($"SMS sending failed: {ex.Message}");
            }
        }).ToList();

        try
        {
            await Task.WhenAll(smsTasksWithErrorHandling);
        }
        catch (Exception ex)
        {
            smsErrors.Add($"SMS batch error: {ex.Message}");
        }

        try
        {
            await Task.WhenAll(telegramTasks);
        }
        catch (Exception ex)
        {
            // Log telegram errors but continue
        }
        // await Task.WhenAll(whatsAppTasks);

        // Save all status updates in a single database transaction
        await _dbContext.SaveChangesAsync();

        var successMessage = $"Members event messages sent successfully! SMS: {messageTasks.Count}, Email: {emailTasks.Count}, Telegram: {telegramTasks.Count}";
        if (smsErrors.Any())
        {
            successMessage += $". SMS Errors: {string.Join("; ", smsErrors)}";
        }

        return new ResponseMessage<string>
        {
            Success = true,
            Message = successMessage
        };
    }
    catch (Exception ex)
    {
        return ExceptionHandler.HandleException<string>(ex);
    }
}

    public async Task<ResponseMessage<List<EventMessageMemberGetDto>>> GetUnsentMessages(bool isSent, Guid? associationId = null)
    {
        try
        {
            var query = _dbContext.MessageMembers
                .Include(x => x.Member)
                .Include(x => x.Message)
                .Where(x => x.MessageStatus == (isSent ? MessageStatus.Sent : MessageStatus.Pending) && x.Message.IsApproved);

            // Filter by association ID if provided (for Association users)
            if (associationId.HasValue)
            {
                query = query.Where(x => x.Message.AssociationId == associationId.Value);
            }

            var messages = await query
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new EventMessageMemberGetDto
                {
                    EventMessageMemberId = x.Id.ToString(),
                    MemberName = x.Member.FullName,
                    MemberPhoneNumber = x.Member.PhoneNumber,
                    MessageContent = x.Message.Content,
                    MessageStatusGet = x.MessageStatus.ToString(),
                    MessageTypeGet = string.Join(", ", x.Message.MessageTypes.Select(mt => mt.ToString()))
                })
                .ToListAsync();

            return new ResponseMessage<List<EventMessageMemberGetDto>>()
            {
                Success = true,
                Data = messages
            };
        }
        catch (Exception ex)
        {
            return ExceptionHandler.HandleException<List<EventMessageMemberGetDto>>(ex);
        }
    }

    public async Task<ResponseMessage> ApproveMessage(Guid messageId, string approvedById)
    {
        try
        {
            var message = await _dbContext.Messages.FindAsync(messageId);
            if (message == null)
                return new ResponseMessage { Success = false, Message = "Message not found" };

            if (message.IsApproved)
                return new ResponseMessage { Success = false, Message = "Message is already approved" };

            message.IsApproved = true;
            // Note: The Message model doesn't have ApprovedDate and ApprovedById fields like other models
            // We could add them if needed, but for now we'll just set IsApproved to true

            await _dbContext.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Message approved successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error approving message: {ex.Message}"
            };
        }
    }

    public async Task<ResponseMessage> RejectMessage(Guid messageId, string rejectedById, string? reason = null)
    {
        try
        {
            var message = await _dbContext.Messages.FindAsync(messageId);
            if (message == null)
                return new ResponseMessage { Success = false, Message = "Message not found" };

            if (message.IsApproved)
                return new ResponseMessage { Success = false, Message = "Cannot reject an already approved message" };

            // For rejection, we could either delete the message or mark it as rejected
            // Since there's no "IsRejected" field, we'll delete it (soft delete by setting RowStatus)
            message.RowStatus = EnumList.RowStatus.INACTIVE;

            await _dbContext.SaveChangesAsync();

            return new ResponseMessage
            {
                Success = true,
                Message = "Message rejected successfully"
            };
        }
        catch (Exception ex)
        {
            return new ResponseMessage
            {
                Success = false,
                Message = $"Error rejecting message: {ex.Message}"
            };
        }
    }
}