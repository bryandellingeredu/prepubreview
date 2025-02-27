
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
                    AuthorPersonId = p.AuthorPersonId,
                    AuthorFirstName = p.AuthorFirstName,
                    AuthorLastName = p.AuthorLastName,  
                    AuthorMiddleName = p.AuthorMiddleName,
                    DateCreated = p.DateCreated,
                    DateUpdated = p.DateUpdated,
                    CreatedByPersonId = p.CreatedByPersonId,
                    UpdatedByPersonId = p.UpdatedByPersonId,
                    PublicationLink = p.PublicationLink,
                    PublicationLinkName = p.PublicationLinkName,
                    LogicalDeleteIn = p.LogicalDeleteIn,
                    DeletedByPersonId = p.DeletedByPersonId,
                    DateDeleted = p.DateDeleted,    
                    PromotedToPress = p.PromotedToPress,
                    PromotedToSocial = p.PromotedToSocial,
                    PromotedToWeb = p.PromotedToWeb,
                    SupervisorPersonId = p.SupervisorPersonId,
                    Threads = p.Threads.Select(t => new PrePublication_Thread
                    {
                        Id = t.Id,
                        Order = t.Order,
                        ReviewStatus = t.ReviewStatus,
                        PublicationId = t.PublicationId,
                        Comments = t.Comments,
                        IsActive = t.IsActive,
                        DateCreated = t.DateCreated,
                        CreatedByPersonId = t.CreatedByPersonId,
                        DateUpdated = t.DateUpdated,
                        UpdatedByPersonId = t.UpdatedByPersonId,
                        SecurityOfficerId = t.SecurityOfficerId,
                        Type = t.Type,
                        AssignedToPersonId = t.AssignedToPersonId,
                       SubjectMatterExperts = t.SMEThreadJunctions.Select(j => new PrePublication_SubjectMatterExpert
                        {
                        Id = j.SubjectMatterExpert.Id,
                        PersonId = j.SubjectMatterExpert.PersonId,
                       }).ToList()
                     }).ToList()
                  })
                  .FirstOrDefaultAsync(cancellationToken);

                 foreach (var thread in publication.Threads){
                    if (!thread.SubjectMatterExperts.Any()){
                        var smelookups = await _context.SMEPubLookups.Where(x => x.PublicationLookup == request.Id).ToListAsync(); 
                        List<PrePublication_SubjectMatterExpert> subjectMatterExperts = new List<PrePublication_SubjectMatterExpert>();
                        foreach (var smelookup in smelookups){
                            thread.SubjectMatterExperts.Add(new PrePublication_SubjectMatterExpert{
                                Id = smelookup.Id,  
                                PersonId = smelookup.SMEPersonId
                            });
                        }
                    }
                 }


                return Result<PrePublication_Publication>.Success(publication);
            }

        }
    }
}