using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.DTOS.Configuration
{
    public record EducationalLevelPostDto
    {
        public string EducationalLevelName { get; set; } = null!;
        public string? Remark { get; set; }
        public string CreatedById { get; set; } = null!;
    }

    public record EducationalLevelGetDto
    {
        public Guid Id { get; set; }
        public string EducationalLevelName { get; set; } = null!;

        public string? Remark { get; set; }

    }
}
