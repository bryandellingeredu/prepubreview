
using Application.Publications;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class PublicationsController : BaseApiController
    {


       [HttpGet]
       public async Task<ActionResult<List<PrePublication_Publication>>> GetPublications()
       {
            return await Mediator.Send(new List.Query());
       }  

    }
}