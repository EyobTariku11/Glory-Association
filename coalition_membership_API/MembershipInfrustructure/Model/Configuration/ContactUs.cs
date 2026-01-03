using MembershipInfrustructure.Model.Authentication;

namespace MembershipInfrustructure.Model.Configuration;

public class ContactUs:  WithIdModel
{
    public string Name { get; set; }
    
    public string Email { get; set; }
    
    public string Subject { get; set; }
    
    public string Message { get; set; }
    
}