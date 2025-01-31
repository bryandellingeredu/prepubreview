using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.TeamMembers
{
    public class List
    {
        public class Query : IRequest<Result<List<PrePublication_TeamMember>>>
        {
          
        }

        public class Handler : IRequestHandler<Query, Result<List<PrePublication_TeamMember>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context) => _context = context;  
            public async Task<Result<List<PrePublication_TeamMember>>> Handle(Query request, CancellationToken cancellationToken)
            {
                List<PrePublication_TeamMember> list = await _context.TeamMembers.ToListAsync(cancellationToken);
                if (list == null){
                    list = new List<PrePublication_TeamMember>();
                }
                 return Result<List<PrePublication_TeamMember>>.Success(list);
            }
        }
    }
}