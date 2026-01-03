namespace MembershipImplementation.DTOS.Users;

public class MemberVerificationDto
{
    public bool IsVerified { get; set; }
    public string? Message { get; set; }
    public MemberVerificationDataDto? Data { get; set; }
}

public class MemberVerificationDataDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string? MemberId { get; set; }
    public string? ImagePath { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Zone { get; set; }
    public string? Woreda { get; set; }
    public DateTime BirthDate { get; set; }
    public string MembershipTypeName { get; set; } = null!;
    public string? AssociationName { get; set; }
    public string? CoalitionName { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string PaymentStatus { get; set; } = null!;
    public bool IsProfileCompleted { get; set; }
    public DateTime CreatedDate { get; set; }
} 