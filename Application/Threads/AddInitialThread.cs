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
    try
    {
        // Set the time zone to Eastern Standard Time
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

        // Prepare lists for new SMEs and junctions
        var newSMEs = new List<PrePublication_SubjectMatterExpert>();
        var junctions = new List<PrePublication_SMEThreadJunction>();

        // Iterate through each SME ID from the request
        foreach (var smeId in request.InitialThreadDTO.SubjectMatterExpertIds)
        {
            // Check if the SME already exists
            var sme = existingSMEs.FirstOrDefault(x => x.PersonId == smeId);

            // If the SME does not exist, create a new SME
            PrePublication_SubjectMatterExpert newSme = null;
            if (sme == null)
            {
                newSme = new PrePublication_SubjectMatterExpert
                {
                    Id = Guid.NewGuid(),
                    PersonId = smeId
                };
                newSMEs.Add(newSme);

                // Create a junction for the new SME and the initial thread
                junctions.Add(new PrePublication_SMEThreadJunction
                {
                    SubjectMatterExpertId = newSme.Id,
                    ThreadId = request.InitialThreadDTO.Id
                });
            }
            else
            {
                // Create a junction for the existing SME and the initial thread
                junctions.Add(new PrePublication_SMEThreadJunction
                {
                    SubjectMatterExpertId = sme.Id,
                    ThreadId = request.InitialThreadDTO.Id
                });
            }

            // Create a new thread for the SME (regardless of whether the SME is new or existing)
            var smeThread = new PrePublication_Thread
            {
                Id = Guid.NewGuid(),
                Comments =  "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have reviewed this article. It contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                SecurityOfficerId = request.InitialThreadDTO.SecurityOfficerId,
                CreatedByPersonId = submitter.PersonId,
                DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
                IsActive = true,
                Type = ThreadType.SME,
                PublicationId = publication.Id,
                AssignedToPersonId = smeId,
                ReviewStatus = string.Empty
            };
            _context.Threads.Add(smeThread);

            // Create a junction for the new SME thread
            junctions.Add(new PrePublication_SMEThreadJunction
            {
                SubjectMatterExpertId = sme?.Id ?? newSme.Id,
                ThreadId = smeThread.Id
            });
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
            CommentsAsHTML = request.InitialThreadDTO.CommentsAsHTML,
            SecurityOfficerId = request.InitialThreadDTO.SecurityOfficerId,
            CreatedByPersonId = submitter.PersonId,
            DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
            IsActive = false,
            Type = ThreadType.Author,
            PublicationId = publication.Id,
            AssignedToPersonId = publication.CreatedByPersonId,
            ReviewStatus = string.Empty
        };
        _context.Threads.Add(initialThread);

        // Update publication status
        publication.Status = StatusType.SentToSMEForReview;
        _context.Publications.Update(publication);

        // Save changes
        var result = await _context.SaveChangesAsync();
        if (result == 0) return Result<Unit>.Failure("Failed to save threads");

        await SendEmail(publication, request.InitialThreadDTO.CommentsAsHTML);

        return Result<Unit>.Success(Unit.Value);
    }
    catch (DbUpdateConcurrencyException ex)
    {
        return Result<Unit>.Failure("Concurrency error: " + ex.Message);
    }
}

            private async Task SendEmail(PrePublication_Publication publication, string comments)
            {
                var threads = await _context.Threads
                .Where(thread => thread.PublicationId == publication.Id)
                .Where(thread =>  thread.Type == ThreadType.SME)
                .ToListAsync();

                foreach (var thread in threads)
                {
                    if(thread.AssignedToPersonId != null){
                        var assignedToPerson =  await _userService.GetUserByPersonIdAsync(thread.AssignedToPersonId.Value);
                        var author = await _userService.GetUserByPersonIdAsync(publication.AuthorPersonId);
                        var creator = await _userService.GetUserByPersonIdAsync(publication.CreatedByPersonId);
                        string title = $"A Subject Matter Expert review has been assigned for {publication.Title}";
                        StringBuilder body = new StringBuilder();
                        body.Append($"<h1> A Subject Matter Expert review has been assigned for {publication.Title} </h1>");
                        body.Append($"<p> <strong> Assigned To: </strong> {assignedToPerson.FirstName} {assignedToPerson.LastName}</p>");
                        body.Append($"<p> <strong> Publication Title: </strong> {publication.Title} </p>");
                        body.Append($"<p> <strong> Author: </strong> {author.FirstName} {author.LastName} </p>");
                        if(string.IsNullOrEmpty(publication.PublicationLink)){
                            string publicationLinkName = "Link To Publication";
                            if (publication.PublicationLinkName != null){
                                publicationLinkName = publication.PublicationLinkName;
                            }
                              body.Append($"<p> <strong> Link To Publication: </strong> <a href='${publication.PublicationLink}'>${publicationLinkName} </p>");
                        }else{
                           body.Append("<p>The publication has been attached</p>");
                        }
                        body.Append("<h4> Author's Comment's");
                        body.Append(comments);
                        string baseUrl =    _config["AppDetails:baseUrl"];
                        body.Append($"<p> <a href='{baseUrl}/threads/{publication.Id}'> Complete your SME review <a/> </p>");
                        List<string> recipients = new List<string>();   
                        if(!string.IsNullOrEmpty(assignedToPerson.EduEmail)) recipients.Add(assignedToPerson.EduEmail);
                        if(!string.IsNullOrEmpty(assignedToPerson.ArmyEmail)) recipients.Add(assignedToPerson.ArmyEmail);
                        List<string> carbonCopyRecipients = new List<string>();   
                        if(!string.IsNullOrEmpty(creator.EduEmail)) carbonCopyRecipients.Add(creator.EduEmail);
                        if(!string.IsNullOrEmpty(creator.ArmyEmail)) carbonCopyRecipients.Add(creator.ArmyEmail);
                        if(creator.PersonId != author.PersonId){
                              if(!string.IsNullOrEmpty(author.EduEmail)) carbonCopyRecipients.Add(author.EduEmail);
                              if(!string.IsNullOrEmpty(author.ArmyEmail)) carbonCopyRecipients.Add(author.ArmyEmail);
                        }
                        if(!string.IsNullOrEmpty(publication.PublicationLink)){
                          await _graphHelper.SendEmailWithoutAttachmentAsync(title, body.ToString(), recipients.ToArray(), carbonCopyRecipients.ToArray());
                        }
                    }
                }    
            }
        }
    }
}