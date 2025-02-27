using Application.Core;
using Application.GraphHelper;
using Application.Repository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System.Text;

namespace Application.Threads
{
    public class ResubmitToSupervisorAfterRevision
    {
        public class Command : IRequest<Result<Unit>>
        {

            public SMEReviewThreadDTO smeReviewThreadDTO { get; set; }
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
                  .FirstOrDefaultAsync(p => p.Threads.Any(t => t.Id == request.smeReviewThreadDTO.ThreadId));

                if (publication == null) return Result<Unit>.Failure("Publication not found");

                // get the order number of the passed in thread
                int orderNumber = publication.Threads.Where(x => x.Id == request.smeReviewThreadDTO.ThreadId).First().Order;

                // Update publication status
                publication.Status = StatusType.SentToSupervisor;

                var thread = publication.Threads.FirstOrDefault(t => t.Id == request.smeReviewThreadDTO.ThreadId);
                if (thread == null) return Result<Unit>.Failure("Thread not found");

                // Update the existing thread
                thread.Comments = request.smeReviewThreadDTO.Comments;
                thread.CommentsAsHTML = request.smeReviewThreadDTO.CommentsAsHtml;
                thread.DateUpdated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone);
                thread.UpdatedByPersonId = submitter.PersonId;
                thread.IsActive = false;
                _context.Entry(thread).State = EntityState.Modified;

                // Create a new thread
                var newThread = new PrePublication_Thread
                {
                    PublicationId = publication.Id,
                    SecurityOfficerId = publication.Threads.Where(x => x.Order == 1).First().SecurityOfficer.Id,
                    CreatedByPersonId = submitter.PersonId,
                    DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
                    Order = orderNumber + 1,
                    IsActive = true,
                    Comments = "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have reviewed this article after author revision. It no longer contains any classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                    AssignedToPersonId = publication.SupervisorPersonId,
                    Type = ThreadType.Supervisor,
                };
                publication.Threads.Add(newThread);
                _context.Entry(newThread).State = EntityState.Added;
                _context.Entry(publication).State = EntityState.Modified;

                try
                {
                    var success = await _context.SaveChangesAsync(cancellationToken) > 0;
                    if (!success)
                    {
                        return Result<Unit>.Failure("Failed to update publication and add new thread");
                    }
                    await SendEmail(request.smeReviewThreadDTO.ThreadId, request.smeReviewThreadDTO.CommentsAsHtml);
                    return Result<Unit>.Success(Unit.Value);


                }
                catch (Exception ex)
                {
                    return Result<Unit>.Failure($"Error: {ex.Message} ");
                }

            }

            private async Task SendEmail(Guid threadId, string commentsAsHtml)
            {
                var publication = await _context.Publications
                .Include(p => p.Threads)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Threads.Any(t => t.Id == threadId));

                var author = await _userService.GetUserByPersonIdAsync(publication.AuthorPersonId);
                var creator = await _userService.GetUserByPersonIdAsync(publication.CreatedByPersonId);
                var supervisor = await _userService.GetUserByPersonIdAsync(publication.SupervisorPersonId.Value); 

                string title = $"A supervisor review has been assigned for {publication.Title} after author revision";
                StringBuilder body = new StringBuilder();
                body.Append($"<h1> {publication.Title} has been revised and has been resubmitted for Supervisor Review </h1>");
                body.Append($"<p> <strong> Assigned To: </strong> {supervisor.FirstName} {supervisor.LastName}</p>");
                body.Append($"<p> <strong> Publication Title: </strong> {publication.Title} </p>");
                if (!string.IsNullOrEmpty(publication.PublicationLink))
                {
                    string publicationLinkName = "Link To Revised Publication";
                    if (publication.PublicationLinkName != null)
                    {
                        publicationLinkName = publication.PublicationLinkName;
                    }
                    body.Append($"<p> <strong> Link To Revised Publication: </strong> <a href='{publication.PublicationLink}'>{publicationLinkName}</a></p>");
                }
                else
                {
                    body.Append("<p>The revised publication has been attached</p>");
                }
                body.Append("<h4> Author's Comments");
                body.Append(commentsAsHtml);
                body.Append("<divider />");
                string baseUrl = _config["AppDetails:baseUrl"];
                body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> Complete your security officer review <a/> </p>");

                List<string> recipients = new List<string>();
                if (!string.IsNullOrEmpty(supervisor.EduEmail)) recipients.Add(supervisor.EduEmail);
                if (!string.IsNullOrEmpty(supervisor.ArmyEmail)) recipients.Add(supervisor.ArmyEmail);

                List<string> carbonCopyRecipients = new List<string>();
                if (!string.IsNullOrEmpty(creator.EduEmail)) carbonCopyRecipients.Add(creator.EduEmail);
                if (!string.IsNullOrEmpty(creator.ArmyEmail)) carbonCopyRecipients.Add(creator.ArmyEmail);
                if (creator.PersonId != author.PersonId)
                {
                    if (!string.IsNullOrEmpty(author.EduEmail)) carbonCopyRecipients.Add(author.EduEmail);
                    if (!string.IsNullOrEmpty(author.ArmyEmail)) carbonCopyRecipients.Add(author.ArmyEmail);
                }
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
        }

     }
}
