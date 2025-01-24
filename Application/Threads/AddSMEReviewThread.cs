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
using Azure.Core;

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

    bool makeNewThread = true;

   // get the order number of the passed in thread
   int orderNumber = publication.Threads.Where(x => x.Id == request.smeReviewThreadDTO.ThreadId).First().Order;

    foreach (var t in publication.Threads.Where(x => x.Order >= orderNumber)){
        if (t.Id != request.smeReviewThreadDTO.ThreadId){
         if(t.IsActive){
          if(t.Type == ThreadType.SME){
            makeNewThread = false;
          }    
         }
        }
    }

     string reviewStatus = "accept";

     if (makeNewThread){
      
    // Update publication status
        if (request.smeReviewThreadDTO.ReviewStatus == "accept")
            {
                var status = StatusType.SentToSecurityForReview;
                if(publication.Threads.Where(x => x.Type == ThreadType.SME).Where(x => x.ReviewStatus == "decline").Where(x => x.Order >= orderNumber).Any()){
                    status = StatusType.RejectedBySME;
                    reviewStatus = "decline";
                  } 
                publication.Status = status;
                
            }
        else
            {
                publication.Status = StatusType.RejectedBySME;
                reviewStatus = "decline";
            }
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

     Guid newThreadId = Guid.NewGuid();

    if (makeNewThread){
        int highestOrder = 0;

        foreach (var th in publication.Threads){
            if(th.Order > highestOrder){
                highestOrder = th.Order;
            }
        }
    // Create the new thread
    var newThread = new PrePublication_Thread
    {
        Id = newThreadId,
        PublicationId = publication.Id,
        SecurityOfficerId = thread.SecurityOfficerId,
        CreatedByPersonId = submitter.PersonId,
        DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone),
        Order = highestOrder + 1,
        IsActive = true,
        Comments = reviewStatus == "accept"
            ? "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have reviewed this article. It contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
            : "{\"blocks\":[{\"key\":\"4gl4r\",\"text\":\"I have revised my article. It now contains no classified or sensitive information. It does not misrepresent current US policy. Recommend Release\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":143,\"style\":\"ITALIC\"}],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}",
        AssignedToPersonId = reviewStatus == "accept"
            ? thread.SecurityOfficer.PersonId
            : publication.CreatedByPersonId,
        Type = reviewStatus == "accept"
            ? ThreadType.OPSEC
            : ThreadType.AuthorRevisionForSME
    };

    // Add the new thread to the publication
    publication.Threads.Add(newThread);
    _context.Entry(newThread).State = EntityState.Added;
    }
    _context.Entry(publication).State = EntityState.Modified;

                try
    {
        // Save all changes
        var success = await _context.SaveChangesAsync(cancellationToken) > 0;
        if (makeNewThread){
            await SendEmail(newThreadId, reviewStatus, orderNumber); 
        }
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

            private async Task SendEmail(Guid threadId, string reviewStatus, int orderNumber)
            {
                var thread = await _context.Threads.FindAsync(threadId);
                var publication = await _context.Publications.FindAsync(thread.PublicationId);

                var smethreads = await _context.Threads
                .Where(x => x.Order >= orderNumber)
                .Where(x => x.PublicationId == thread.PublicationId)
                .Where(x => x.Type == ThreadType.SME).ToListAsync(); 

                var assignedToPerson =  await _userService.GetUserByPersonIdAsync(thread.AssignedToPersonId.Value);
                var author = await _userService.GetUserByPersonIdAsync(publication.AuthorPersonId);
                var creator = await _userService.GetUserByPersonIdAsync(publication.CreatedByPersonId);
                 
                 List<USAWCUser> smeUsers = new  List<USAWCUser>();

                 foreach (var smeThread in smethreads){
                    var smeUser = await _userService.GetUserByPersonIdAsync(smeThread.AssignedToPersonId.Value);
                    smeUsers.Add(smeUser);
                 }  
 
                
                
                string title = $"A Security Officer review has been assigned for {publication.Title}";
                if(reviewStatus == "decline"){
                    title = $"{publication.Title} has been rejected by an SME";
                }

                StringBuilder body = new StringBuilder();
                  body.Append($"<h1>{title}</h1>");
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
                   body.Append("<h4> SME's Comments");
                   foreach  (var smeThread in smethreads){
                      var smeUser = await _userService.GetUserByPersonIdAsync(smeThread.AssignedToPersonId.Value);
                       body.Append($"<h5> SME:  {smeUser.FirstName} {smeUser.LastName} </h5>");
                       body.Append($"<h5> Status: {(smeThread.ReviewStatus == "accept" ? "Publication Accepted" : "Publication Rejected")} </h5>");
                       body.Append(smeThread.CommentsAsHTML);
                       body.Append("<divider />");
                      }
                       string baseUrl =    _config["AppDetails:baseUrl"];
                       if(reviewStatus == "accept")
                       {
                            body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> Complete your OPSEC review <a/> </p>");
                       }
                       else {
                             body.Append($"<p> <a href='{baseUrl}?redirecttopath=threads/{publication.Id}'> Revise your publication and resubmit to SME <a/> </p>");
                            }
                      
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
                         foreach  (var smeUser in smeUsers){
                            if(!string.IsNullOrEmpty(smeUser.EduEmail)) carbonCopyRecipients.Add(smeUser.EduEmail); 
                             if(!string.IsNullOrEmpty(smeUser.ArmyEmail)) carbonCopyRecipients.Add(smeUser.ArmyEmail);
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