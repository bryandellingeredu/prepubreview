using Application.Core;
using MediatR;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;
using Application.Repository;
using System.Data.Common;
using System.Text;
using Microsoft.Extensions.Configuration;
using Application.GraphHelper;

namespace Application.Threads
{
    public class AddSMEReviewThread
    {
            public class Command : IRequest<Result<Unit>>{

            public SMEReviewThreadDTO smeReviewThreadDTO {get; set;}
            public string Email {get; set;}
         
    }

       public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUSAWCUserService _userService;
            private readonly IConfiguration _config;
            
            private readonly IGraphHelperService _graphHelper;

             

            public Handler(
                DataContext context,
                IUSAWCUserService userService,
                IConfiguration config,
                IGraphHelperService graphHelper
                )   
            {
                _context = context;
                _userService = userService;
                _config = config; 
                _graphHelper = graphHelper;  
            }

public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
{
    TimeZoneInfo easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");

    // Get the submitter
    var submitter = await _userService.GetUserByEmailAsync(request.Email);
    if (submitter == null) return Result<Unit>.Failure("Submitter not found");

    // Get the publication with threads
    var publication = await _context.Publications
        .Include(p => p.Threads)
        .ThenInclude(s => s.SecurityOfficer)
        .FirstOrDefaultAsync(p => p.Threads.Any(t => t.Id == request.smeReviewThreadDTO.ThreadId));

    if (publication == null) return Result<Unit>.Failure("Publication not found");

    // Update publication status
    if (request.smeReviewThreadDTO.ReviewStatus == "accepted")
    {
        publication.Status = StatusType.SentToSecurityForReview;
    }
    else
    {
        publication.Status = StatusType.RejectedBySME;
    }



    // Find the existing thread
    var thread = publication.Threads.FirstOrDefault(t => t.Id == request.smeReviewThreadDTO.ThreadId);
    if (thread == null) return Result<Unit>.Failure("Thread not found");

    // Update the existing thread
    thread.ReviewStatus = request.smeReviewThreadDTO.ReviewStatus;
    thread.Comments = request.smeReviewThreadDTO.Comments;
    thread.CommentsAsHTML = request.smeReviewThreadDTO.CommentsAsHtml;
    thread.DateUpdated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone);
    thread.UpdatedByPersonId = submitter.PersonId;
    thread.IsActive = false;

    _context.Entry(thread).State = EntityState.Modified;

    // Create the new thread
    var newThread = new PrePublication_Thread
    {
        Id = Guid.NewGuid(),
        PublicationId = publication.Id,
        SecurityOfficerId = thread.SecurityOfficerId,
        CreatedByPersonId = submitter.PersonId,
        DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
        IsActive = true,
        Comments = request.smeReviewThreadDTO.ReviewStatus == "accepted"
            ? "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have reviewed this article. It contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
            : "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have revised my article. It now contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
        AssignedToPersonId = request.smeReviewThreadDTO.ReviewStatus == "accepted"
            ? thread.SecurityOfficer.PersonId
            : publication.CreatedByPersonId,
        Type = request.smeReviewThreadDTO.ReviewStatus == "accepted"
            ? ThreadType.OPSEC
            : ThreadType.AuthorRevisionForSME
    };

    // Add the new thread to the publication
    publication.Threads.Add(newThread);
    _context.Entry(newThread).State = EntityState.Added;
    _context.Entry(publication).State = EntityState.Modified;

                try
    {
        // Save all changes
        var success = await _context.SaveChangesAsync(cancellationToken) > 0;

        if (!success)
            return Result<Unit>.Failure("Failed to update publication and add new thread");

        return Result<Unit>.Success(Unit.Value);
    }
    catch (DbUpdateConcurrencyException ex)
    {
        // Log the concurrency issue
        //_logger.LogError(ex, "Concurrency exception while saving changes.");
        return Result<Unit>.Failure("Concurrency issue detected. Please retry.");
    }
}
    }

    }

}