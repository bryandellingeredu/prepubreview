using Application.Core;
using Azure.Core;
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
          public PublicationListDTO PublicationListDTO { get; set; }
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
    IQueryable<PrePublication_Publication> query = _context.Publications.AsQueryable();

    if (request.PublicationListDTO.FromDate.HasValue)
    {
        DateTime fromDate = request.PublicationListDTO.FromDate.Value.Date; // Strip time
        query = query.Where(p => p.DateCreated.Date >= fromDate);
    }

    if (request.PublicationListDTO.ToDate.HasValue)
    {
    DateTime toDate = request.PublicationListDTO.ToDate.Value.Date; // Strip time
    query = query.Where(p => p.DateCreated.Date <= toDate);
    }

    if (!string.IsNullOrEmpty(request.PublicationListDTO.Title))
        query = query.Where(p => EF.Functions.Like(p.Title.ToLower(), $"%{request.PublicationListDTO.Title.ToLower()}%"));

    if (!string.IsNullOrEmpty(request.PublicationListDTO.Author))
    {
        string searchAuthor = request.PublicationListDTO.Author.ToLower();
        query = query.Where(p =>
            EF.Functions.Like(p.AuthorFirstName.ToLower(), $"%{searchAuthor}%") ||
            EF.Functions.Like(p.AuthorLastName.ToLower(), $"%{searchAuthor}%"));
    }

    if (request.PublicationListDTO.Status.HasValue)
    {
        StatusType statusEnum = (StatusType)request.PublicationListDTO.Status.Value;
        query = query.Where(p => p.Status == statusEnum);
    }

    query = query
        .OrderBy(s => s.Status == StatusType.Complete ? 1 : 0)
        .ThenByDescending(p => p.DateCreated)
        .Skip(request.PublicationListDTO.Offset)
        .Take(request.PublicationListDTO.Limit);

    var results = await query.ToListAsync();

    // If no data, add a single empty publication
    if (!results.Any())
    {
        results.Add(new PrePublication_Publication
        {
            Id = Guid.Empty,
            Title = "No Data Found",
            DateCreated = DateTime.Now
        });
    }

    return Result<List<PrePublication_Publication>>.Success(results);
}
        }
    }
}