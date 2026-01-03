using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.DTOS.Configuration
{
    public record CoursePostDto
    {

        public string FileName { get; set; }
        public string Description { get; set; }
        public IFormFile? File { get; set; }
        public Guid MembershipTypeId { get; set; }

        public string CreatedById { get; set; }
    }

    public record CourseGetDto
    {

        public Guid Id { get; set; }
        public string FileName { get; set; }
        public string Description { get; set; }
        public string? FilePath { get; set; }

        public IFormFile? File { get; set; }

        public string? MembershipType { get; set; }
        public Guid MembershipTypeId { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
