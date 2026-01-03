using Microsoft.AspNetCore.Http;

namespace MembershipImplementation.DTOS.Events;

public record DonationTargetPostDto
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double TargetAmount { get; set; }
    public Guid? EventId { get; set; } // Optional - can be standalone
    public Guid AssociationId { get; set; } // Will be set from authenticated user
}

public record DonationTargetGetDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public double TargetAmount { get; set; }
    public double? AmountCollected { get; set; }
    
    // Association information
    public Guid AssociationId { get; set; }
    public string AssociationName { get; set; } = null!;
    public string? AssociationLogoPath { get; set; }
    
    // Event information (if linked to an event)
    public Guid? EventId { get; set; }
    public string? EventTitle { get; set; }
    
    // Status
    public bool IsActive { get; set; }
    public bool IsApproved { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? ApprovedById { get; set; }
    
    // Progress percentage
    public double ProgressPercentage => TargetAmount > 0 ? (AmountCollected ?? 0) / TargetAmount * 100 : 0;
    
    // Metadata
    public DateTime CreatedDate { get; set; }
    public string CreatedById { get; set; } = null!;
}

// New DTO specifically for creating donations for donation targets
public record DonationTargetDonationPostDto
{
    public string DonorName { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; } // Optional
    public double Amount { get; set; }
    public string? Message { get; set; } // Optional message
    public Guid? MemberId { get; set; } // Optional: if donor is a logged-in member
    public string? ArifPaySessionId { get; set; } // ArifPay session ID
    public string? DonationReference { get; set; } // Donation reference for tracking
} 