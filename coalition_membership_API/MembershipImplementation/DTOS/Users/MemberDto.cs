namespace MembershipImplementation.DTOS.Users;

public class MemberPayment2Dto
{
    public string TransactionReference { get; set; } = null!;
    public string PaymentUrl { get; set; } = null!;
    public double Amount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public DateTime LastPaidDate { get; set; }
    public string PaymentStatus { get; set; } = null!;
}


public class MemberDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public string? MembershipTypeName { get; set; }
    public List<MemberPayment2Dto> Payments { get; set; } = new();
    
    public string? memberId { get; set; }

    public DateTime? ExpiryDate { get; set; }
}
