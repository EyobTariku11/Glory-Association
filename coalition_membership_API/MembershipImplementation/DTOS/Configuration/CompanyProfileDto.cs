using Microsoft.AspNetCore.Http;

namespace MembershipImplementation.DTOS.Configuration;

public record CompanyProfilePostDto
{

    public string Title { get; set; }
    
    public string LocalTitle { get; set; }
    public IFormFile? DashboardImage { get; set; }
    
    public IFormFile? AboutUsLogoPath { get; set; }
    
    public string Description { get; set; }
    
    public string LocalDescription { get; set; }
    public string AboutUs { get; set; }
    
    public string LocalAboutUs { get; set; }
    
    public string CreatedById { get; set; }
    
    public Guid? AssociationId { get; set; }
    
}


public record CompanyProfileGetDto : CompanyProfilePostDto
{
    
    public Guid Id { get; set; }
    
    public string DashboardImagePath { get; set; }
    
    public string AboutLogoPath { get; set; }
    
    
    public int MembersCount { get; set; }
    
    public double DonationCount { get; set; }
    
    public int EventsPerYear { get; set; }
    
}