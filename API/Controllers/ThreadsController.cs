
using System.Security.Claims;
using API.Attributes;
using Application.Threads;
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

        [AuthorizeUSAWCEmail]
        [HttpPost("addSMEReviewThread")]
        public async Task<IActionResult> addSMEReviewThread([FromBody] SMEReviewThreadDTO smeReviewThreadDTO){
            var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
           return   HandleResult(await Mediator.Send(
                new AddSMEReviewThread.Command { smeReviewThreadDTO = smeReviewThreadDTO, Email = email }));
        }

        [AuthorizeUSAWCEmail]
        [HttpPost("resubmitToSMEAfterRevision")]
        public async Task<IActionResult> ResubmitToSMEAfterRevision([FromBody] SMEReviewThreadDTO smeReviewThreadDTO)
        {
            var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
            return HandleResult(await Mediator.Send(
                 new ResubmitToSMEAfterRevision.Command { smeReviewThreadDTO = smeReviewThreadDTO, Email = email }));
        }

        [AuthorizeUSAWCEmail]
        [HttpPost("resubmitToOPSECAfterRevision")]
        public async Task<IActionResult> ResubmitToOPSECAfterRevision([FromBody] SMEReviewThreadDTO smeReviewThreadDTO)
        {
            var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
            return HandleResult(await Mediator.Send(
                 new ResubmitToOPSECAfterRevision.Command { smeReviewThreadDTO = smeReviewThreadDTO, Email = email }));
        }

        [AuthorizeUSAWCEmail]
        [HttpPost("addOPSECReviewThread")]
        public async Task<IActionResult> addOPSECReviewThread([FromBody] SMEReviewThreadDTO smeReviewThreadDTO)
        {
            var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
            return HandleResult(await Mediator.Send(
                 new AddOPSECReviewThread.Command { smeReviewThreadDTO = smeReviewThreadDTO, Email = email }));
        }
    }
}