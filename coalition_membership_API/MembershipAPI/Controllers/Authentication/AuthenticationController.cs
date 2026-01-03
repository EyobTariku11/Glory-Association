using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Implementation.DTOS.Authentication;
using Implementation.Interfaces.Authentication;
using Implementation.Helper;
using System.Net;
using MembershipInfrustructure.Model.Authentication;
using Microsoft.AspNetCore.Identity;
using MembershipImplementation.Interfaces.HRM;
using MembershipImplementation.DTOS.Configuration;

namespace ERPSystems.Controllers.Authentication
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        IAuthenticationService _authenticationService;
        IMemberService _memberService;


        public AuthenticationController(IAuthenticationService authenticationService,IMemberService memberService)
        {
            _authenticationService = authenticationService;
            _memberService = memberService;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="loginDto"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (ModelState.IsValid)
            {
               return Ok (await _authenticationService.Login(loginDto));
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> Register(MembersPostDto memberRegister)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _memberService.RegisterMember(memberRegister));
            }
            else
            {
                return BadRequest();
            }
        }



        [HttpGet]
        [ProducesResponseType(typeof(UserListDto), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserList()
        {
           return Ok(await _authenticationService.GetUserList());
        }

        [HttpGet]
        [ProducesResponseType(typeof(RoleDropDown), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetRoleCategory()
        {
            return Ok(await _authenticationService.GetRoleCategory());
        }

        [HttpGet]
        [ProducesResponseType(typeof(RoleDropDown), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetNotAssignedRole(string userId, int categoryId)
        {
            return Ok(await _authenticationService.GetNotAssignedRole(userId,categoryId));
        }

        [HttpGet]
        [ProducesResponseType(typeof(RoleDropDown), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAssignedRoles(string userId, int categoryId)
        {
            return Ok(await _authenticationService.GetAssignedRoles(userId, categoryId));
        }


        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AddUser([FromBody] AddUSerDto addUSer)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _authenticationService.AddUser(addUSer));
            }
            else
            {
                return BadRequest();
            }
        }



        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> AssingRole(UserRoleDto userRole)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _authenticationService.AssignRole(userRole));
            }
            else
            {
                return BadRequest();
            }
        }



        [HttpPost]
        [ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> RevokeRole(UserRoleDto userRole)
        {
            if (ModelState.IsValid)
            {
                return Ok(await _authenticationService.RevokeRole(userRole));
            }
            else
            {
                return BadRequest();
            }
        }

        //[HttpPost]
        //[ProducesResponseType(typeof(ResponseMessage), (int)HttpStatusCode.OK)]
        //public async Task<IActionResult> ChangeStatusOfUser(string userId)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        return Ok(await _authenticationService.ChangeStatusOfUser(userId));
        //    }
        //    else
        //    {
        //        return BadRequest();
        //    }
        //}


    }
}
