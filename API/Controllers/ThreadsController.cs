
using System.Security.Claims;
using API.Attributes;
using Application.Threads;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ThreadsController : BaseApiController
    {
        [AuthorizeUSAWCEmail]
        [HttpPost("addinitial")]
        public async Task<IActionResult> AddInitial([FromBody] InitialThreadDTO initialThreadDTO){
            var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
           return   HandleResult(await Mediator.Send(
                new AddUpdateInitialThread.Command { InitialThreadDTO = initialThreadDTO, Email = email }));
        }
    }
}