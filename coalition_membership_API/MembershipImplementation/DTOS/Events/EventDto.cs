using Microsoft.AspNetCore.Http;
using System.ComponentModel;

namespace MembershipImplementation.DTOS.Events;

public record EventPostDto
{
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Description { get; set; } = null!;
    public IFormFile? Image { get; set; }
    
    // Event specific fields
    public DateTime EventDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Location { get; set; } = null!;
    public string? EventType { get; set; }
    
    // Donation capabilities
    [DefaultValue(false)]
    public bool IsDonationEnabled { get; set; } = false;
    public double? TargetAmount { get; set; }
    
    // Association ID (will be set from the authenticated user)
    public Guid AssociationId { get; set; }
}

public record EventGetDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Description { get; set; } = null!;
    public string? ImagePath { get; set; }
    public IFormFile? Image { get; set; }
    
    // Event specific fields
    public DateTime EventDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Location { get; set; } = null!;
    public string? EventType { get; set; }
    
    // Donation capabilities
    public bool IsDonationEnabled { get; set; } = false;
    public double? TargetAmount { get; set; }
    public double? AmountCollected { get; set; }
    
    // Approval workflow
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovedById { get; set; }
    
    // Association information
    public Guid AssociationId { get; set; }
    public string AssociationName { get; set; } = null!;
    public string? AssociationLogoPath { get; set; }
    
    // Metadata
    public DateTime CreatedDate { get; set; }
    public string CreatedById { get; set; } = null!;
}

public record EventDonationPostDto
{
    public Guid? EventId { get; set; } // Optional: can be null for standalone donations
    public string? DonorName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public double Amount { get; set; }
    public Guid? MemberId { get; set; } // Optional: if donor is a logged-in member
    public string? ArifPaySessionId { get; set; } // ArifPay session ID
    public string? DonationReference { get; set; } // Donation reference for tracking
}

public record EventDonationGetDto
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public string EventTitle { get; set; } = null!;
    public string? DonorName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public double Amount { get; set; }
    public string TransactionReference { get; set; } = null!;
    public bool IsPaid { get; set; } = false;
    public DateTime? PaymentDate { get; set; }
    public Guid? MemberId { get; set; }
    public string? MemberName { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; }
    public DateTime CreatedDate { get; set; }
} 