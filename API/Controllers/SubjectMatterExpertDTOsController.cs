using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.SubjectMatterExpertDTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class SubjectMatterExpertDTOsController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List<UserWithSubjectsDTO>>> GetSubjectMatterExpertDTOs() =>
            HandleResult(await Mediator.Send(new List.Query{}));
    }
}