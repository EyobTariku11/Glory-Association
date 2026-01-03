using System;
using static MembershipInfrustructure.Data.EnumList;

namespace MembershipImplementation.DTOS.Configuration
{
    public class GeneralCodeUpsertDto
    {
        public Guid? Id { get; set; }
        public GeneralCodeType GeneralCodeType { get; set; }
        public string InitialName { get; set; } = null!;
        public int Pad { get; set; }
        public int CurrentNumber { get; set; }
        public Guid AssociationId { get; set; }
        public string? CreatedById { get; set; }
    }
}


