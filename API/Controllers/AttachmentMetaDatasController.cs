using System.Runtime.CompilerServices;
using API.Attributes;
using Application.AttachmentMetaDatas;
using Domain;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class AttachmentMetaDatasController : BaseApiController
    {
        [AuthorizeUSAWCEmail]
        [HttpGet("{lookupid}")] 
         public async Task<ActionResult<List<PrePublication_AttachmentMetaData>>> GetPublications(Guid lookupid) =>
            HandleResult(await Mediator.Send(new Details.Query { LookupId = lookupid }));

        [AuthorizeUSAWCEmail]
        [HttpDelete("{lookupid}")] 
         public async Task<IActionResult> Delete(Guid lookupid) =>
            HandleResult(await Mediator.Send(new Delete.Command { LookupId = lookupid }));

    }


}