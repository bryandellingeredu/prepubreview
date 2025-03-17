using Application.Core;
using MediatR;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;
using Application.Repository;
using System.Text;
using Microsoft.Extensions.Configuration;
using Application.GraphHelper;

namespace Application.Threads
{
    public class AddSupervisorReviewThread
    {
        public class Command : IRequest<Result<Unit>>
        {

            public SMEReviewThreadDTO supervisorReviewThreadDTO { get; set; }
            public string Email { get; set; }

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

                var submitter = await _userService.GetUserByEmailAsync(request.Email);
                if (submitter == null) return Result<Unit>.Failure("Submitter not found");

                var publication = await _context.Publications
                    .Include(p => p.Threads)
                    .ThenInclude(s => s.SecurityOfficer)
                    .FirstOrDefaultAsync(p => p.Threads.Any(t => t.Id == request.supervisorReviewThreadDTO.ThreadId));

                if (publication == null) return Result<Unit>.Failure("Publication not found");

                var thread = publication.Threads.FirstOrDefault(t => t.Id == request.supervisorReviewThreadDTO.ThreadId);
                if (thread == null) return Result<Unit>.Failure("Thread not found");

                thread.ReviewStatus = request.supervisorReviewThreadDTO.ReviewStatus;
                thread.Comments = request.supervisorReviewThreadDTO.Comments;
                thread.CommentsAsHTML = request.supervisorReviewThreadDTO.CommentsAsHtml;
                thread.DateUpdated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone);
                thread.UpdatedByPersonId = submitter.PersonId;
                thread.IsActive = false;

                _context.Entry(thread).State = EntityState.Modified;

                int orderNumber = thread.Order;

                switch (request.supervisorReviewThreadDTO.ReviewStatus?.ToLower())
                {
                    case "accept":
                        publication.Status = StatusType.SentToSMEForReview;

                        var smePubLookups = (await _context.SMEPubLookups
                         .Where(x => x.PublicationLookup == publication.Id)
                         .Select(x => new { x.Id, x.SMEPersonId })
                        .ToListAsync())  // Fetch data first
                        .DistinctBy(x => x.SMEPersonId)  // Remove duplicates in memory
                        .ToList();

                        var existingSMEs = await _context.SubjectMatterExperts
                            .Where(x => smePubLookups.Select(y => y.SMEPersonId).Contains(x.PersonId))
                            .ToListAsync();

                        var newSMEs = new List<PrePublication_SubjectMatterExpert>();
                        var junctions = new List<PrePublication_SMEThreadJunction>();

                        foreach (var smePubLookup in smePubLookups)
                        {
                            orderNumber++;
                            var sme = existingSMEs.FirstOrDefault(x => x.PersonId == smePubLookup.SMEPersonId);
                            PrePublication_SubjectMatterExpert newSme = null;

                            if (sme == null)
                            {
                                newSme = new PrePublication_SubjectMatterExpert
                                {
                                    Id = smePubLookup.Id,
                                    PersonId = smePubLookup.SMEPersonId
                                };
                                newSMEs.Add(newSme);
                            }

                            var smeThread = new PrePublication_Thread
                            {
                                Id = Guid.NewGuid(),
                                Order = orderNumber,
                                Comments = "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have reviewed this article. It contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                                SecurityOfficerId = thread.SecurityOfficerId,
                                CreatedByPersonId = submitter.PersonId,
                                DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
                                IsActive = true,
                                Type = ThreadType.SME,
                                PublicationId = publication.Id,
                                AssignedToPersonId = smePubLookup.SMEPersonId,
                                ReviewStatus = string.Empty
                            };

                            _context.Threads.Add(smeThread);
                            junctions.Add(new PrePublication_SMEThreadJunction
                            {
                                SubjectMatterExpertId = sme?.Id ?? newSme.Id,
                                ThreadId = smeThread.Id
                            });
                        }

                        if (newSMEs.Any()) _context.SubjectMatterExperts.AddRange(newSMEs);
                        _context.SMEThreadJunctions.AddRange(junctions);

                        var result = await _context.SaveChangesAsync();
                        await SendEmail(request.supervisorReviewThreadDTO.ThreadId, request.supervisorReviewThreadDTO.ReviewStatus, request.supervisorReviewThreadDTO.CommentsAsHtml);
                        return result > 0 ? Result<Unit>.Success(Unit.Value) : Result<Unit>.Failure("Failed to save threads");

                    default:
                        var newThread = new PrePublication_Thread
                        {
                            PublicationId = publication.Id,
                            SecurityOfficerId = thread.SecurityOfficerId,
                            CreatedByPersonId = submitter.PersonId,
                            DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
                            Order = orderNumber + 1,
                            IsActive = true,
                            Comments = "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have revised my article. It now contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                            AssignedToPersonId = publication.CreatedByPersonId,
                            Type = ThreadType.AuthorRevisionForSupervisor
                        };

                        publication.Threads.Add(newThread);
                        _context.Entry(newThread).State = EntityState.Added;
                        _context.Entry(publication).State = EntityState.Modified;

                        var success = await _context.SaveChangesAsync(cancellationToken) > 0;
                        await SendEmail(request.supervisorReviewThreadDTO.ThreadId, request.supervisorReviewThreadDTO.ReviewStatus,  request.supervisorReviewThreadDTO.CommentsAsHtml);
                        return success ? Result<Unit>.Success(Unit.Value) : Result<Unit>.Failure("Failed to update publication and add new thread");
                }
            }

           private async Task SendEmail(Guid threadId, string reviewStatus, string commentsAsHTML)
            {
                var publication = await _context.Publications
                 .Include(p => p.Threads)
                 .AsNoTracking()
                 .FirstOrDefaultAsync(p => p.Threads.Any(t => t.Id == threadId));

                

                var supervisorPerson = await _userService.GetUserByPersonIdAsync(publication.SupervisorPersonId.Value);
                var author = await _userService.GetUserByPersonIdAsync(publication.AuthorPersonId);
                var creator = await _userService.GetUserByPersonIdAsync(publication.CreatedByPersonId);

                  if (reviewStatus == "decline")
                  {
                   string title = $"{publication.Title} has been rejected by the Supervisor";
                   StringBuilder body = new StringBuilder();
                   body.Append($"<h1>{title}</h1>");
                   body.Append($"<p> <strong> Assigned To: </strong> {creator.FirstName} {creator.LastName}</p>");
                   body.Append($"<p> <strong> Publication Title: </strong> {publication.Title} </p>");
                   body.Append($"<p> <strong> Author: </strong> {author.FirstName} {author.LastName} </p>");
                    if (!string.IsNullOrEmpty(publication.PublicationLink))
                    {
                        string publicationLinkName = "Link To Publication";
                        if (publication.PublicationLinkName != null)
                        {
                            publicationLinkName = publication.PublicationLinkName;
                        }
                        body.Append($"<p> <strong> Link To Publication: </strong> <a href='{publication.PublicationLink}'>{publicationLinkName}</a></p>");
                    }
                     
                    else
                    {
                        body.Append("<p>The publication has been attached</p>");
                    }
                    body.Append("<h4> Supervisor's Comments");
                    body.Append($"<p> <strong> Supervisor: </strong> {supervisorPerson.FirstName} {supervisorPerson.LastName}</p>");
                    body.Append(commentsAsHTML);
                    string baseUrl = _config["AppDetails:baseUrl"];
                     body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> Revise your publication and resubmit to your supervisor <a/> </p>");
                    List<string> recipients = new List<string>();
                    if (!string.IsNullOrEmpty(creator.EduEmail)) recipients.Add(creator.EduEmail);
                    if (!string.IsNullOrEmpty(creator.ArmyEmail)) recipients.Add(creator.ArmyEmail);
                    if (creator.PersonId != author.PersonId)
                    {
                       if (!string.IsNullOrEmpty(author.EduEmail)) recipients.Add(author.EduEmail);

                    }
                     List<string> carbonCopyRecipients = new List<string>();
                     if (!string.IsNullOrEmpty(supervisorPerson.EduEmail)) carbonCopyRecipients.Add(supervisorPerson.EduEmail);
                     if (!string.IsNullOrEmpty(supervisorPerson.ArmyEmail)) carbonCopyRecipients.Add(supervisorPerson.ArmyEmail);
                     if (!string.IsNullOrEmpty(publication.PublicationLink))
                     {
                        await _graphHelper.SendEmailWithoutAttachmentAsync(title, body.ToString(), recipients.ToArray(), carbonCopyRecipients.ToArray());
                     }
                     else
                    {
                       var attachmentMeta = _context.AttachmentMetaDatas.FirstOrDefault(x => x.LookupId == publication.Id);
                       var attachment = _context.Attachments.FirstOrDefault(x => x.Id == attachmentMeta.AttachmentLookupId);
                       if (attachment != null)
                       {
                        await _graphHelper.SendEmailWithAttachmentAsync(
                           title, body.ToString(), recipients.ToArray(), carbonCopyRecipients.ToArray(),
                           attachmentMeta.FileName, attachmentMeta.FileType, attachment.ItemId);
                        }
                    }
                  }
                  else
                  {

                     var threads = await _context.Threads
                    .Where(thread => thread.PublicationId == publication.Id)
                    .Where(thread =>  thread.Type == ThreadType.SME)
                    .ToListAsync();

                foreach (var thread in threads)
                {
                    if(thread.AssignedToPersonId != null){
                        var assignedToPerson =  await _userService.GetUserByPersonIdAsync(thread.AssignedToPersonId.Value);
                        string title = $"A Subject Matter Expert review has been assigned for {publication.Title}";
                        StringBuilder body = new StringBuilder();
                        body.Append($"<h1> A Subject Matter Expert review has been assigned for {publication.Title} </h1>");
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
                        string baseUrl =    _config["AppDetails:baseUrl"];
                        body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> Complete your SME review <a/> </p>");
                        List<string> recipients = new List<string>();   
                        if(!string.IsNullOrEmpty(assignedToPerson.EduEmail)) recipients.Add(assignedToPerson.EduEmail);
                        if(!string.IsNullOrEmpty(assignedToPerson.ArmyEmail)) recipients.Add(assignedToPerson.ArmyEmail);
                        List<string> carbonCopyRecipients = new List<string>();   
                        if(!string.IsNullOrEmpty(creator.EduEmail)) carbonCopyRecipients.Add(creator.EduEmail);
                        if(!string.IsNullOrEmpty(creator.ArmyEmail)) carbonCopyRecipients.Add(creator.ArmyEmail);
                          if (!string.IsNullOrEmpty(supervisorPerson.EduEmail)) carbonCopyRecipients.Add(supervisorPerson.EduEmail);
                     if (!string.IsNullOrEmpty(supervisorPerson.ArmyEmail)) carbonCopyRecipients.Add(supervisorPerson.ArmyEmail);
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
            }
        }
    }
}

        
