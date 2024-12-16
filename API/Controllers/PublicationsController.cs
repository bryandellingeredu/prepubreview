
using Application.Publications;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class PublicationsController : BaseApiController
    {


  [HttpGet]
        public async Task<ActionResult<List<PrePublication_Publication>>> GetPublications([FromQuery] int offset = 0, [FromQuery] int limit = 100) =>
            HandleResult(await Mediator.Send(new List.Query { Offset = offset, Limit = limit }));
    }


}