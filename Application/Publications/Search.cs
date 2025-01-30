using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Publications
{
    public class Search
    {
        public class Query : IRequest<Result<List<PrePublication_Publication>>>
        {
            public PublicationSearchDTO PublicationSearchDTO { get; set; }
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
                // Validate the search query
                if (string.IsNullOrWhiteSpace(request.PublicationSearchDTO.SearchQuery))
                {
                    return Result<List<PrePublication_Publication>>.Success(new List<PrePublication_Publication>());
                }

                // Perform case-insensitive search
                var query = request.PublicationSearchDTO.SearchQuery.ToLower();

                var publications = await _context.Publications
                     .Where(x => x.LogicalDeleteIn == false)
                    .Where(x => x.Title.ToLower().Contains(query) ||
                                x.AuthorLastName.ToLower().Contains(query) ||
                                x.AuthorFirstName.ToLower().Contains(query))
                    .ToListAsync(cancellationToken);

                return Result<List<PrePublication_Publication>>.Success(publications);
            }
        }
    }
}