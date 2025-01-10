using API.Attributes;
using Application.SecurityOfficers;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class SecurityOfficersController : BaseApiController
    {
        [AuthorizeUSAWCEmail]
        [HttpGet] 
        public async Task<ActionResult<List<PrePublication_SecurityOfficer>>> GetSecurityOfficers() =>
            HandleResult(await Mediator.Send(new List.Query {})); 

        [AuthorizeAdmin]
        [HttpPost]
        public async Task<IActionResult> CreateUpdate([FromBody] PrePublication_SecurityOfficer prePublication_SecurityOfficer) =>
             HandleResult(await Mediator.Send(
                new CreateUpdate.Command { PrePublication_SecurityOfficer = prePublication_SecurityOfficer }));

        [AuthorizeAdmin]
        [HttpDelete("{id}")] 
        public async Task<IActionResult> Delete(Guid id) =>
           HandleResult(await Mediator.Send(new Delete.Command { Id= id }));
    }
}