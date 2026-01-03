using System.ComponentModel;
using Microsoft.AspNetCore.Http;

namespace MembershipImplementation.DTOS.Donation;

public record DonationEventPostDto
{
    public string Title { get; set; }
    
    public string? SubTitle { get; set; }
    
    public string ? Description { get; set; }
    
    public IFormFile ? ImageFile { get; set; }
    
    [DefaultValue(false)]
    public bool IsDonation { get; set; }
    
    [DefaultValue(0.0)]
    public double Amount { get; set; }
}

public record DonationEventGetDto :DonationEventPostDto
{
    
    public string Id { get; set; }
    
    public string ImagePath { get; set; }
    
    public DateTime CreatedDate { get; set; }
    
    public double ? AmountCollected { get; set; }
    
}