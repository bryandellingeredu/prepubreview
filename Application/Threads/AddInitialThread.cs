using Application.Core;
using MediatR;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;
using Application.Repository;
using System.Data.Common;

namespace Application.Threads
{
    public class AddUpdateInitialThread
    {
         public class Command : IRequest<Result<Unit>>{
            public InitialThreadDTO InitialThreadDTO {get; set;}
            public string Email {get; set;}
         }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUSAWCUserService _userService;

            public Handler(DataContext context, IUSAWCUserService userService)
            {
                _context = context;
                _userService = userService;
            }

     public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken){
    try
    {
         TimeZoneInfo easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
        // Get the submitter's details
        var submitter = await _userService.GetUserByEmailAsync(request.Email);
        if (submitter == null) return Result<Unit>.Failure("Submitter not found");

        // Find the publication
        var publication = await _context.Publications.FindAsync(request.InitialThreadDTO.PublicationId);
        if (publication == null) return Result<Unit>.Failure("Publication not found");

        // Check if the thread already exists
        var existingThread = await _context.Threads
            .Where(x => x.Id == request.InitialThreadDTO.Id)
            .FirstOrDefaultAsync();

        if (existingThread != null)
        {
            return Result<Unit>.Failure("Thread already exists");
        }

        // Batch lookup for existing SMEs
        var existingSMEs = await _context.SubjectMatterExperts
            .Where(x => request.InitialThreadDTO.SubjectMatterExpertIds.Contains(x.PersonId))
            .ToListAsync();

        var newSMEs = new List<PrePublication_SubjectMatterExpert>();
        var junctions = new List<PrePublication_SMEThreadJunction>();

        foreach (var smeId in request.InitialThreadDTO.SubjectMatterExpertIds)
        {
            var sme = existingSMEs.FirstOrDefault(x => x.PersonId == smeId);
            if (sme == null)
            {
                var newSme = new PrePublication_SubjectMatterExpert
                {
                    Id = Guid.NewGuid(),
                    PersonId = smeId
                };
                newSMEs.Add(newSme);

                junctions.Add(new PrePublication_SMEThreadJunction
                {
                    SubjectMatterExpertId = newSme.Id,
                    ThreadId = request.InitialThreadDTO.Id
                });

                junctions.Add(new PrePublication_SMEThreadJunction
                {
                    SubjectMatterExpertId = newSme.Id,
                    ThreadId = request.InitialThreadDTO.NextThreadId
                });
            }
            else
            {
                junctions.Add(new PrePublication_SMEThreadJunction
                {
                    SubjectMatterExpertId = sme.Id,
                    ThreadId = request.InitialThreadDTO.Id
                });

                junctions.Add(new PrePublication_SMEThreadJunction
                {
                    SubjectMatterExpertId = sme.Id,
                    ThreadId = request.InitialThreadDTO.NextThreadId
                });
            }
        }

        // Add new SMEs and junctions to the context
        if (newSMEs.Any())
        {
            _context.SubjectMatterExperts.AddRange(newSMEs);
        }
        _context.SMEThreadJunctions.AddRange(junctions);

        // Create the initial thread
        var initialThread = new PrePublication_Thread
        {
            Id = request.InitialThreadDTO.Id,
            Comments = request.InitialThreadDTO.Comments,
            SecurityOfficerId = request.InitialThreadDTO.SecurityOfficerId,
            CreatedByPersonId = submitter.PersonId,
            DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
            IsActive = false,
            Type = ThreadType.Author,
            PublicationId = publication.Id
        };

        // Create the next thread
        var nextThread = new PrePublication_Thread
        {
            Id = request.InitialThreadDTO.NextThreadId,
            Comments = string.Empty,
            SecurityOfficerId = request.InitialThreadDTO.SecurityOfficerId,
            CreatedByPersonId = submitter.PersonId,
            DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
            IsActive = true,
            Type = ThreadType.SME,
            PublicationId = publication.Id
        };

        // Update publication status
        publication.Status = StatusType.SentToSMEForReview;
        _context.Publications.Update(publication);

        // Add the threads to the context
        _context.Threads.Add(initialThread);
        _context.Threads.Add(nextThread);

        // Save changes
        var result = await _context.SaveChangesAsync();
        if (result == 0) return Result<Unit>.Failure("Failed to save threads");

        return Result<Unit>.Success(Unit.Value);
    }
    catch (DbUpdateConcurrencyException ex)
    {
        return Result<Unit>.Failure("Concurrency error: " + ex.Message);
    }
}


        }
    }
}