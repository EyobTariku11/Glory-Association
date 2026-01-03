using AutoMapper;
using MembershipImplementation.DTOS.HRM;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static MembershipInfrustructure.Data.EnumList;

using MembershipInfrustructure.Data;
using MembershipImplementation.DTOS.Configuration;
using MembershipInfrustructure.Model.Configuration;
using MembershipImplementation.DTOS.Configuration;
using MembershipInfrustructure.Model.Users;
using MembershipImplementation.DTOS.Payment;
using MembershipImplementation.DTOS.Coalition;
using MembershipInfrustructure.Model.Coalition;

namespace MembershipImplementation.Datas
{
    public class AutoMapperConfigurations : Profile
    {

        public AutoMapperConfigurations()
        {

            //CreateMap<EmployeeList, EmployeeGetDto>()
            //    .ForMember(a => a.Id, e => e.MapFrom(mfg => mfg.Id))

            //    .ForMember(a => a.Gender, e => e.MapFrom(mfg => mfg.Gender.ToString()))
            //    .ForMember(a => a.EmploymentPosition, e => e.MapFrom(mfg => mfg.EmploymentPosition.ToString()))
            //    .ForMember(a => a.EmploymentStatus, e => e.MapFrom(mfg => mfg.EmploymentStatus.ToString()));

            CreateMap<GeneralCodes, GeneralCodeDto>()
           .ForMember(a => a.GeneralCode, e => e.MapFrom(mfg => mfg.GeneralCodeType.ToString()));
            CreateMap<MembershipInfrustructure.Model.Users.Member, MembersGetDto>();

            CreateMap<Member,MembersGetDto>()
              .ForMember(a => a.MembershipType, e => e.MapFrom(mfg => mfg.MembershipType.Name))
            .ForMember(a => a.Gender, e => e.MapFrom(mfg => mfg.Gender!=null? mfg.Gender.ToString():""));

            CreateMap<MemberPayment, MemberPaymentDto>();
            
            // Board Member mappings
            CreateMap<BoardMember, BoardMemberDto>()
                .ForMember(dest => dest.PhotoPath, opt => opt.MapFrom(src => src.PhotoPath));
            
            CreateMap<BoardMemberPostDto, BoardMember>();
            CreateMap<BoardMemberUpdateDto, BoardMember>();

        }
    }
}
