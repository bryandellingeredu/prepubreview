using Microsoft.AspNetCore.Mvc;
using API.Attributes;
using Application.Uploads;

namespace API.Controllers
{
    public class UploadController : BaseApiController
    {
        [AuthorizeUSAWCEmail]
        [HttpPost]
        public async Task<IActionResult> Add(
            [FromForm] string lookupId,
            [FromForm] Add.Command command
            )
           {
            command.LookupId = Guid.Parse(lookupId);
            return HandleResult(await Mediator.Send(command));
            }
    }
}