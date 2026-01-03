using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MembershipImplementation.DTOS.Configuration
{
    public class EducationalFieldPostDto
    {
        public string EducationalFieldName { get; set; } = null!;
        public string? Remark { get; set; }
        public string CreatedById { get; set; } = null!;
    }

    public record EducationalFieldGetDto
    {
        public Guid Id { get; set; }
        public string EducationalFieldName { get; set; } = null!;
        public string? Remark { get; set; }
    }
}
