
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Publications
{
    public class List
    {
        public class Query : IRequest<List<PrePublication_Publication>>
        {

        }

        public class Handler : IRequestHandler<Query, List<PrePublication_Publication>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context) {
                _context = context;
            }
            public async Task<List<PrePublication_Publication>> Handle(Query request, CancellationToken cancellationToken)
            {
                return await _context.Publications.ToListAsync();
            }
        }
    }
}
