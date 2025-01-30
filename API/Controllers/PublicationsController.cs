
using API.Attributes;
using Application.Publications;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace API.Controllers
{
    public class PublicationsController : BaseApiController
    {

        [AuthorizeUSAWCEmail]
        [HttpPost("filterlist")]
        public async Task<ActionResult<List<PrePublication_Publication>>> GetPublications([FromBody] PublicationListDTO publicationListDTO) =>
            HandleResult(await Mediator.Send(new List.Query { PublicationListDTO = publicationListDTO}));

        [AuthorizeUSAWCEmail]
        [HttpGet("mine")]
        public async Task<ActionResult<List<PrePublication_Publication>>> GetMyPublications()
        {
            var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress");
            return HandleResult(await Mediator.Send(new ListMine.Query { Email = email }));
        }


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

          [HttpDelete("{id}")]
          public async Task<IActionResult> Delete(Guid id) =>
           HandleResult(await Mediator.Send(new Delete.Command { Id = id, Email =  User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")}));
        
    } 
}