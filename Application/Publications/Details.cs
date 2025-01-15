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
             
                var publication = await _context.Publications
                 .Include(p => p.Threads)
                 .ThenInclude(t => t.SMEThreadJunctions)
                 .ThenInclude(j => j.SubjectMatterExpert)
                 .Where(p => p.Id == request.Id)
                .Select(p => new PrePublication_Publication
                {
                    Id = p.Id,
                    Title = p.Title,
                    Status = p.Status,
                    AuthorFirstName = p.AuthorFirstName,
                    AuthorLastName = p.AuthorLastName,  
                    AuthorMiddleName = p.AuthorMiddleName,
                    DateCreated = p.DateCreated,
                    DateUpdated = p.DateUpdated,
                    CreatedByPersonId = p.CreatedByPersonId,
                    UpdatedByPersonId = p.UpdatedByPersonId,
                    PublicationLink = p.PublicationLink,
                    PublicationLinkName = p.PublicationLinkName,
                    Threads = p.Threads.Select(t => new PrePublication_Thread
                    {
                        Id = t.Id,
                        PublicationId = t.PublicationId,
                        Comments = t.Comments,
                        IsActive = t.IsActive,
                        DateCreated = t.DateCreated,
                        CreatedByPersonId = t.CreatedByPersonId,
                        DateUpdated = t.DateUpdated,
                        UpdatedByPersonId = t.UpdatedByPersonId,
                        SecurityOfficerId = t.SecurityOfficerId,
                        Type = t.Type,
                       SubjectMatterExperts = t.SMEThreadJunctions.Select(j => new PrePublication_SubjectMatterExpert
                        {
                        Id = j.SubjectMatterExpert.Id,
                        PersonId = j.SubjectMatterExpert.PersonId,
                       }).ToList()
                     }).ToList()
                  })
                  .FirstOrDefaultAsync(cancellationToken);


                return Result<PrePublication_Publication>.Success(publication);
            }

        }
    }
}