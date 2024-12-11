using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class PublicationsController : BaseApiController
    {
        private readonly DataContext _context;
       public PublicationsController(DataContext context)
       {
          _context = context; 
       } 

       [HttpGet]
       public async Task<ActionResult<List<PrePublication_Publication>>> GetPublications()
       {
         return await _context.Publications.ToListAsync();
       }  

    }
}