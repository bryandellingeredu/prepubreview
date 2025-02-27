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
using System.Text.Json;

namespace Application.Threads
{
    public class AddUpdateInitialSupervisorThread
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




            // Create a new thread for the Supervisor
            var smeThread = new PrePublication_Thread
            {
                Id = Guid.NewGuid(),
                Order = 2,
                Comments =  "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have reviewed this article. It contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                SecurityOfficerId = request.InitialThreadDTO.SecurityOfficerId,
                CreatedByPersonId = submitter.PersonId,
                DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
                IsActive = true,
                Type = ThreadType.Supervisor,
                PublicationId = publication.Id,
                AssignedToPersonId = request.InitialThreadDTO.SupervisorPersonId,
                ReviewStatus = string.Empty
            };
            _context.Threads.Add(smeThread);



        // Create the initial thread
        var initialThread = new PrePublication_Thread
        {
            Id = request.InitialThreadDTO.Id,
            Order = 1,
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
        publication.Status = StatusType.SentToSupervisor;
        publication.SupervisorPersonId = request.InitialThreadDTO.SupervisorPersonId;

         List<PrePublication_SMEPubLookup> sMEPubLookups = new List<PrePublication_SMEPubLookup>();

         foreach (int PersonId in request.InitialThreadDTO.SubjectMatterExpertIds){
            sMEPubLookups.Add(new PrePublication_SMEPubLookup{
                PublicationLookup = request.InitialThreadDTO.PublicationId,
                SMEPersonId = PersonId,
            });
         }
        _context.Publications.Update(publication);
        _context.SMEPubLookups.AddRange(sMEPubLookups);

        // Save changes
        var result = await _context.SaveChangesAsync();
        if (result == 0) return Result<Unit>.Failure("Failed to save threads");

        await SendEmail(publication, request.InitialThreadDTO.CommentsAsHTML);
       // await SendAdaptiveCard(publication, request.InitialThreadDTO.CommentsAsHTML);

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
                .Where(thread =>  thread.Type == ThreadType.Supervisor)
                .ToListAsync();

                foreach (var thread in threads)
                {
                    if(thread.AssignedToPersonId != null){
                        var assignedToPerson =  await _userService.GetUserByPersonIdAsync(thread.AssignedToPersonId.Value);
                        var author = await _userService.GetUserByPersonIdAsync(publication.AuthorPersonId);
                        var creator = await _userService.GetUserByPersonIdAsync(publication.CreatedByPersonId);
                        string title = $"A Supervisor review has been assigned for {publication.Title}";
                        StringBuilder body = new StringBuilder();
                        body.Append($"<h1> A Supervisor review has been assigned for {publication.Title} </h1>");
                        body.Append($"<p> <strong> Assigned To: </strong> {assignedToPerson.FirstName} {assignedToPerson.LastName}</p>");
                        body.Append($"<p> <strong> Publication Title: </strong> {publication.Title} </p>");
                        body.Append($"<p> <strong> Author: </strong> {author.FirstName} {author.LastName} </p>");
                        if(!string.IsNullOrEmpty(publication.PublicationLink)){
                            string publicationLinkName = "Link To Publication";
                            if (publication.PublicationLinkName != null){
                                publicationLinkName = publication.PublicationLinkName;
                            }
                              body.Append($"<p> <strong> Link To Publication: </strong> <a href='{publication.PublicationLink}'>{publicationLinkName}</a></p>");
                        }else{
                           body.Append("<p>The publication has been attached</p>");
                        }
                        body.Append("<h4> Author's Comment's </h4>");
                        body.Append(comments);
                        string baseUrl =    _config["AppDetails:baseUrl"];
                        body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> Complete your Supervisor review <a/> </p>");
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
                        else
                        {
                          var attachmentMeta = _context.AttachmentMetaDatas.FirstOrDefault(x => x.LookupId == publication.Id);
                          var attachment = _context.Attachments.FirstOrDefault(x => x.Id == attachmentMeta.AttachmentLookupId);
                          if(attachment != null) {
                                await _graphHelper.SendEmailWithAttachmentAsync(
                                   title, body.ToString(), recipients.ToArray(), carbonCopyRecipients.ToArray(),
                                   attachmentMeta.FileName, attachmentMeta.FileType, attachment.ItemId);
                            }
                        }

                        
                    }
                }    
            }

                private async Task SendAdaptiveCard(PrePublication_Publication publication, string comments)
                {
                    var threads = await _context.Threads
                        .Where(thread => thread.PublicationId == publication.Id && thread.Type == ThreadType.SME)
                        .ToListAsync();

                    foreach (var thread in threads)
                    {
                        if (thread.AssignedToPersonId != null)
                        {
                            var assignedToPerson = await _userService.GetUserByPersonIdAsync(thread.AssignedToPersonId.Value);
                            var author = await _userService.GetUserByPersonIdAsync(publication.AuthorPersonId);
                            var creator = await _userService.GetUserByPersonIdAsync(publication.CreatedByPersonId);
                            string title = $"A Subject Matter Expert review has been assigned for {publication.Title}";

                            var adaptiveCardJson = new
                            {
                                type = "AdaptiveCard",
                                version = "1.4",
                                body = new object[]
                                {
                                    new
                                    {
                                        type = "TextBlock",
                                        text = title,
                                        weight = "Bolder",
                                        size = "Medium"
                                    },
                                    new
                                    {
                                        type = "FactSet",
                                        facts = new[]
                                        {
                                            new { title = "Assigned To:", value = $"{assignedToPerson.FirstName} {assignedToPerson.LastName}" },
                                            new { title = "Publication Title:", value = publication.Title },
                                            new { title = "Author:", value = $"{author.FirstName} {author.LastName}" },
                                            new { title = "Comments:", value = comments }
                                        }
                                    },
                                    new
                                    {
                                        type = "TextBlock",
                                        text = !string.IsNullOrEmpty(publication.PublicationLink)
                                            ? $"[Link To Publication]({publication.PublicationLink})"
                                            : "The publication has been attached",
                                        wrap = true
                                    },
                                    new
                                    {
                                        type = "ActionSet",
                                        actions = new object[]
                                        {
                                            new
                                            {
                                                type = "Action.OpenUrl",
                                                title = "Complete your SME review",
                                                url = $"{_config["AppDetails:baseUrl"]}?redirecttopath=threads/{publication.Id}"
                                            }
                                        }
                                    }
                                }
                            };

                            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                            var adaptiveCardPayload = JsonSerializer.Serialize(adaptiveCardJson, options);

                            if (!string.IsNullOrEmpty(assignedToPerson.EduEmail))
                            {
                                await _graphHelper.SendChatWithAdaptiveCardAsync(assignedToPerson.EduEmail, adaptiveCardPayload);
                            }
                        }
                    }
                }
        

        }
    }
}
