using Application.Core;
using Application.Repository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.SecurityOfficers
{
    public class List
    {
        public class Query : IRequest<Result<List<PrePublication_SecurityOfficer>>>{}

        public class Handler : IRequestHandler<Query, Result<List<PrePublication_SecurityOfficer>>>
        {
             private readonly DataContext _context;

            public Handler(DataContext context) => _context = context;  
             
            public async Task<Result<List<PrePublication_SecurityOfficer>>> Handle(Query request, CancellationToken cancellationToken)
            {
                  List<PrePublication_SecurityOfficer> list = await _context.SecurityOfficers.ToListAsync(cancellationToken);

                  if (list == null)  list = new List<PrePublication_SecurityOfficer>();

                return Result<List<PrePublication_SecurityOfficer>>.Success(list);
                              
            }
        }
    }
}