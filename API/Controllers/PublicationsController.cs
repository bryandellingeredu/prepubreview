
using API.Attributes;
using Application.Publications;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class PublicationsController : BaseApiController
    {

        [AuthorizeUSAWCEmail]
        [HttpGet]
        public async Task<ActionResult<List<PrePublication_Publication>>> GetPublications([FromQuery] int offset = 0, [FromQuery] int limit = 100) =>
            HandleResult(await Mediator.Send(new List.Query { Offset = offset, Limit = limit }));
        
        [AuthorizeUSAWCEmail]
        [HttpGet("{id}")]
        public async Task<ActionResult<PrePublication_Publication>> GetPublications(Guid id) => 
           HandleResult(await Mediator.Send(new Details.Query { Id = id }));    

        [AuthorizeUSAWCEmail]
        [HttpPost]
        public async Task<IActionResult> CreateUpdatePublication([FromBody] PublicationDTO publicationDTO) =>
             HandleResult(await Mediator.Send(
                new CreateUpdatePublication.Command { PublicationDTO = publicationDTO }));

        [HttpPost("search")] 
               public async Task<ActionResult<List<PrePublication_Publication>>> Search([FromBody]  PublicationSearchDTO publicationSearchDTO) =>
         HandleResult(await Mediator.Send(new Search.Query { PublicationSearchDTO = publicationSearchDTO }));
        
    } 
}