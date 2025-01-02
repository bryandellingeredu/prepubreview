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
           public async Task<Result<PrePublication_Publication>> Handle(Query request, CancellationToken cancellationToken)
            {
                PrePublication_Publication publication = await _context.Publications
                    .Include(t => t.Threads)
                    .ThenInclude(s => s.SubjectMatterExperts)
                    .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

                    if (publication?.Threads != null)
                        {
                            foreach (var thread in publication.Threads)
                            {
                                if (thread.SubjectMatterExperts != null)
                                    {
                                        foreach (var sme in thread.SubjectMatterExperts)
                                            {
                                                sme.Thread = null; // Nullify self-referencing property
                                            }
                                     }
                                thread.Publication = null; // Nullify self-referencing property
                             }               
                        }
                        

                    return Result<PrePublication_Publication>.Success(publication);
                }
                
        }
    }
}