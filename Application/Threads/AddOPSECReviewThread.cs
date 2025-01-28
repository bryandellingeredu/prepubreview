using Application.Core;
using Application.GraphHelper;
using Application.Repository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Threads
{
    public class AddOPSECReviewThread
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
                // Get the submitter
                var submitter = await _userService.GetUserByEmailAsync(request.Email);
                if (submitter == null) return Result<Unit>.Failure("Submitter not found");

                // Get the publication with threads
                var publication = await _context.Publications
                    .Include(p => p.Threads)
                    .ThenInclude(s => s.SecurityOfficer)
                    .FirstOrDefaultAsync(p => p.Threads.Any(t => t.Id == request.smeReviewThreadDTO.ThreadId));

                if (publication == null) return Result<Unit>.Failure("Publication not found");

                int orderNumber = publication.Threads.Where(x => x.Id == request.smeReviewThreadDTO.ThreadId).First().Order;

                // Update publication status

                if (request.smeReviewThreadDTO.ReviewStatus == "accept")
                {
                    publication.Status = StatusType.Complete;
                }
                else
                {
                    publication.Status = StatusType.RejectedBySecurity;
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

                // if the opsec review create a new thread otherwise we don't need to make a new thread as we are complete

                if (request.smeReviewThreadDTO.ReviewStatus == "decline")
                {
                    //get the security officer from the first thread.
                    var securityOfficer = publication.Threads.Where(x => x.Order == 1).First().SecurityOfficer;

                    var newThread = new PrePublication_Thread
                    {
                        PublicationId = publication.Id,
                        SecurityOfficerId = securityOfficer.Id,
                        CreatedByPersonId = submitter.PersonId,
                        DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
                        Order = orderNumber + 1,
                        IsActive = true,
                        Comments = "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have revised my article. It now contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
                        AssignedToPersonId = publication.CreatedByPersonId,
                        Type = ThreadType.AuthorRevisionForOPSEC
                    };

                    // Add the new thread to the publication
                    publication.Threads.Add(newThread);
                    _context.Entry(newThread).State = EntityState.Added;

                }
                _context.Entry(publication).State = EntityState.Modified;
                try
                {
                    var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                    if (!success)
                        return Result<Unit>.Failure("Failed to update publication and add new thread");

                    await SendEmail(request.smeReviewThreadDTO.ThreadId, request.smeReviewThreadDTO.ReviewStatus, orderNumber, request.smeReviewThreadDTO.CommentsAsHtml);

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (Exception ex)
                {

                    return Result<Unit>.Failure($"Error: {ex.Message}");
                }
            }

            private async Task SendEmail(Guid threadId, string reviewStatus, int orderNumber, string commentsAsHTML)
            {
                var publication = await _context.Publications
                 .Include(p => p.Threads)
                 .ThenInclude(s => s.SecurityOfficer)
                 .AsNoTracking()
                 .FirstOrDefaultAsync(p => p.Threads.Any(t => t.Id == threadId));

                

                var securityOfficerPerson = await _userService.GetUserByPersonIdAsync(publication.Threads.Where(x => x.Order == 1).First().SecurityOfficer.PersonId);
                var author = await _userService.GetUserByPersonIdAsync(publication.AuthorPersonId);
                var creator = await _userService.GetUserByPersonIdAsync(publication.CreatedByPersonId);

                string title = $"The Security Officer has reviewed {publication.Title} and the review process is complete";
                if (reviewStatus == "decline")
                {
                    title = $"{publication.Title} has been rejected by the Security Officer";
                }

                StringBuilder body = new StringBuilder();
                body.Append($"<h1>{title}</h1>");
                if (reviewStatus == "decline")
                {
                    body.Append($"<p> <strong> Assigned To: </strong> {creator.FirstName} {creator.LastName}</p>");
                }

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
                    body.Append("<h4> Security Officer's Comments");
                    body.Append($"<p> <strong> Security Officer: </strong> {securityOfficerPerson.FirstName} {securityOfficerPerson.LastName}</p>");
                    body.Append($"<h5> Status: {(reviewStatus == "accept" ? "Publication Accepted" : "Publication Rejected")} </h5>");
                    body.Append(commentsAsHTML);
                    body.Append("<divider />");
                    string baseUrl = _config["AppDetails:baseUrl"];
                   if (reviewStatus == "accept")
                   {
                    body.Append("<p> Congragulations! your publication has successfully completed the review process and is ready for publication </p>");
                    body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> view your publication workflow history <a/> </p>");
                    }
                    else
                   {
                    body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> Revise your publication and resubmit to the security officer <a/> </p>");
                    }

                   List<string> recipients = new List<string>();
                if (!string.IsNullOrEmpty(creator.EduEmail)) recipients.Add(creator.EduEmail);
                if (!string.IsNullOrEmpty(creator.ArmyEmail)) recipients.Add(creator.ArmyEmail);
                if (creator.PersonId != author.PersonId)
                {
                    if (!string.IsNullOrEmpty(author.EduEmail)) recipients.Add(author.EduEmail);

                }
                List<string> carbonCopyRecipients = new List<string>();
                if (!string.IsNullOrEmpty(securityOfficerPerson.EduEmail)) carbonCopyRecipients.Add(securityOfficerPerson.EduEmail);
                if (!string.IsNullOrEmpty(securityOfficerPerson.ArmyEmail)) carbonCopyRecipients.Add(securityOfficerPerson.ArmyEmail);

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
