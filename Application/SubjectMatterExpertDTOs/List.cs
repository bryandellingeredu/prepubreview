using Application.Core;
using Application.Repository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.SubjectMatterExpertDTOs
{
    public class List
    {
      public class Query : IRequest<Result<List<UserWithSubjectsDTO>>>{}

        public class Handler : IRequestHandler<Query, Result<List<UserWithSubjectsDTO>>>
        {
            private readonly ISubjectMatterExpertDTOService _service;

            public Handler(ISubjectMatterExpertDTOService service) => _service = service;   
         
            public async Task<Result<List<UserWithSubjectsDTO>>> Handle(Query request, CancellationToken cancellationToken) =>
              Result<List<UserWithSubjectsDTO>>.Success(await _service.GetSubjectMatterExpertsDTOsAsync());
        }
    }
}