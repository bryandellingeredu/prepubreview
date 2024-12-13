using Application.AppUsers;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace API.Controllers
{
    public class AppUsersController : BaseApiController
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login(){
            var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
            return HandleResult(await Mediator.Send(
                new Login.Command { Email = email }));
             
        }

    }
}