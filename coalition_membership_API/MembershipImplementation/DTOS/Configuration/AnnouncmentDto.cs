using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.DTOS.Configuration
{
    public record AnnouncmentPostDto
    {

        public IFormFile? Image { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EpiredDate { get; set; }

        public string CreatedById { get; set; }
    }

    public record AnnouncmentGetDto
    {
        public Guid Id { get; set; }
        public string? ImagePath { get; set; }

        public IFormFile ? Image { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime EpiredDate { get; set; }
    }
}
