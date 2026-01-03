namespace MembershipImplementation.DTOS.Configuration;

public record ContactUsDto
{
    public string? Id { get; set; }
    public string Email { get; init; }
    
    public string Name { get; set; }
    
    public string Subject { get; set; }
    
    public string Message { get; set; }
    
    public DateTime CreatedDate { get; init; }
};