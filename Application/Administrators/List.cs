using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Administrators
{
    public class List
    {
        public class Query : IRequest<Result<List<PrePublication_Administrator>>>
        {
          
        }

        public class Handler : IRequestHandler<Query, Result<List<PrePublication_Administrator>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context) => _context = context;  
            public async Task<Result<List<PrePublication_Administrator>>> Handle(Query request, CancellationToken cancellationToken)
            {
                List<PrePublication_Administrator> list = await _context.Administrators.ToListAsync(cancellationToken);
                if (list == null){
                    list = new List<PrePublication_Administrator>();
                }
                 return Result<List<PrePublication_Administrator>>.Success(list);
            }
        }
    }
}