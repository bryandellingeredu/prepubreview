using System.Runtime.CompilerServices;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Publications
{
    public class Details
    {
          public class Query : IRequest<Result<PrePublication_Publication>>
          {
              public Guid Id { get; set; }
          }

        public class Handler : IRequestHandler<Query, Result<PrePublication_Publication>>
          {

           private readonly DataContext _context;

           public Handler(DataContext context) =>   _context = context;
           
            public async Task<Result<PrePublication_Publication>> Handle(Query request, CancellationToken cancellationToken) =>
                Result<PrePublication_Publication>.Success(await _context.Publications.FindAsync(request.Id, cancellationToken));   
        }


    }
}