using API.Attributes;
using Application.Administrators;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AdministratorsController : BaseApiController
    {
        [AuthorizeUSAWCEmail]
        [HttpGet] 
        public async Task<ActionResult<List<PrePublication_Administrator>>> GetAdministrators() =>
            HandleResult(await Mediator.Send(new List.Query {})); 

        [AuthorizeUSAWCEmail]
        [HttpPost]
        public async Task<IActionResult> CreateAdministrator([FromBody] AdministratorDTO administratorDTO) =>
             HandleResult(await Mediator.Send(
                new Create.Command { AdministratorDTO = administratorDTO }));

        [AuthorizeUSAWCEmail]
        [HttpDelete("{id}")] 
        public async Task<IActionResult> Delete(Guid id) =>
           HandleResult(await Mediator.Send(new Delete.Command { Id= id }));
 
    }
}