using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Publications
{
    public class List
    {
        public class Query : IRequest<Result<List<PrePublication_Publication>>>
        {
            public int Offset { get; set; } // Number of rows to skip
            public int Limit { get; set; } // Number of rows to return
        }

        public class Handler : IRequestHandler<Query, Result<List<PrePublication_Publication>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<PrePublication_Publication>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var publications = await _context.Publications
                    .OrderBy(s => s.Status == StatusType.Complete ? 1 : 0)
                    .ThenByDescending(p => p.DateCreated)
                    .Skip(request.Offset)
                    .Take(request.Limit)
                    .ToListAsync(cancellationToken);

                // If no data, add a single empty publication
                if (!publications.Any())
                {
                    publications.Add(new PrePublication_Publication
                    {
                        Id = Guid.Empty,
                        Title = "No Data Found",
                        DateCreated = DateTime.Now
                    });
                }

                return Result<List<PrePublication_Publication>>.Success(publications);
            }
        }
    }
}