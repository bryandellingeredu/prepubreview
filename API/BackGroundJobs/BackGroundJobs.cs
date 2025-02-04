using Application.GraphHelper;
using Application.Repository;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Text;
using System.Threading;

namespace API.BackGroundJobs
{
    public class BackGroundJobs
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;
        private readonly IUSAWCUserService _userService;
        private readonly IGraphHelperService _graphHelper;

        public BackGroundJobs(DataContext context, IConfiguration config, IUSAWCUserService userService, IGraphHelperService graphHelper)
        {
            _context = context;
            _config = config;
            _userService = userService;
            _graphHelper = graphHelper;
        }

        [AutomaticRetry(Attempts = 0)]
        public async Task EmailNotificationJob()
        {
            await EmailNotificationJobAsync();
        }

        public async Task EmailNotificationJobAsync()
        {
            try
            {
                var easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
                var threeDaysAgoEastern = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone).AddDays(-3);
                var tenDaysAgoEastern = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone).AddDays(-10);

                // Get threads that are pending
                var threads = await _context.Threads
                    .Include(x => x.Publication)
                    .Where(x => x.DateUpdated == null) // Still pending
                    .Where(x => x.AssignedToPersonId != null)
                    .Where(x => x.Publication.LogicalDeleteIn != true)
                    .Where(x => x.Publication.Status != Domain.StatusType.Complete)
                    .ToListAsync(); // Fetch first

                // Filter threads older than 3 days but within the 10-day limit
                var filteredThreads = threads
                    .Where(x => x.DateCreated < threeDaysAgoEastern)
                    .Where(x => x.DateCreated > tenDaysAgoEastern)
                    .ToList();

                if (!filteredThreads.Any()) return; // No pending items to process

                // Build the report
                var reportBuilder = new StringBuilder();
                reportBuilder.Append("<h1>Pending Publications Report</h1>");
                reportBuilder.Append("<table border='1'><tr><th>Publication Title</th><th>Assigned To</th><th>Days Pending</th></tr>");

                // Process notifications
                foreach (var thread in filteredThreads)
                {
                    try
                    {
                        if (thread.Publication == null)
                        {
                            Console.WriteLine($"Skipping thread {thread.Id} because Publication is null.");
                            continue;
                        }

                        var user = await _userService.GetUserByPersonIdAsync(thread.AssignedToPersonId.Value);
                        var author = await _userService.GetUserByPersonIdAsync(thread.Publication.AuthorPersonId);
                        var creator = await _userService.GetUserByPersonIdAsync(thread.Publication.CreatedByPersonId);

                        // Calculate days pending
                        int daysPending = (DateTime.UtcNow - thread.DateCreated).Days;

                        // Append to report with clickable link
                        string baseUrl = _config["AppDetails:baseUrl"];
                        string publicationUrl = $"{baseUrl}?redirecttopath=threads/{thread.Publication.Id}";

                        reportBuilder.Append($"<tr>");
                        reportBuilder.Append($"<td><a href='{publicationUrl}'>{thread.Publication.Title}</a></td>");
                        reportBuilder.Append($"<td>{user.FirstName} {user.LastName}</td>");
                        reportBuilder.Append($"<td>{daysPending} days</td>");
                        reportBuilder.Append($"</tr>");

                        // Email notification title
                        string title = $"A Pre Publication task assigned to you for {thread.Publication.Title} has been pending for over three days";

                        // Email body
                        StringBuilder body = new StringBuilder();
                        body.Append($"<h1>{title}</h1>");
                        body.Append($"<p><strong>Publication Title:</strong> {thread.Publication.Title}</p>");
                        body.Append($"<p><strong>Author:</strong> {author.FirstName} {author.LastName}</p>");

                        if (!string.IsNullOrEmpty(thread.Publication.PublicationLink))
                        {
                            string publicationLinkName = thread.Publication.PublicationLinkName ?? "Link To Publication";
                            body.Append($"<p><strong>Link To Publication:</strong> <a href='{thread.Publication.PublicationLink}'>{publicationLinkName}</a></p>");
                        }
                        else
                        {
                            body.Append("<p>The publication has been attached</p>");
                        }

                        body.Append($"<p><a href='{baseUrl}?redirecttopath=threads/{thread.Publication.Id}'>Please complete your task</a></p>");

                        List<string> recipients = new List<string>();
                        if (!string.IsNullOrEmpty(user.ArmyEmail)) recipients.Add(user.ArmyEmail);
                        if (!string.IsNullOrEmpty(user.EduEmail)) recipients.Add(user.EduEmail);

                        List<string> carbonCopyRecipients = new List<string>();
                        if (!string.IsNullOrEmpty(creator.EduEmail)) carbonCopyRecipients.Add(creator.EduEmail);
                        if (!string.IsNullOrEmpty(creator.ArmyEmail)) carbonCopyRecipients.Add(creator.ArmyEmail);
                        if (creator.PersonId != author.PersonId)
                        {
                            if (!string.IsNullOrEmpty(author.EduEmail)) carbonCopyRecipients.Add(author.EduEmail);
                            if (!string.IsNullOrEmpty(author.ArmyEmail)) carbonCopyRecipients.Add(author.ArmyEmail);
                        }

                        // Send email
                        if (!string.IsNullOrEmpty(thread.Publication.PublicationLink))
                        {
                            await _graphHelper.SendEmailWithoutAttachmentAsync(title, body.ToString(), recipients.ToArray(), carbonCopyRecipients.ToArray());
                        }
                        else
                        {
                            var attachmentMeta = _context.AttachmentMetaDatas.FirstOrDefault(x => x.LookupId == thread.Publication.Id);
                            if (attachmentMeta != null)
                            {
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
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing thread {thread.Id}: {ex.Message}");
                    }
                }

                // Close the report table
                reportBuilder.Append("</table>");

                // Send the report to a group of people
                var reportTitle = "Pending Publication Tasks Summary Report";
                var PrePubTeamMembers = await _context.TeamMembers.ToListAsync();
                var reportRecipients = new List<string>();

                foreach (var item in PrePubTeamMembers)
                {
                    try
                    {
                        var teamMember = await _userService.GetUserByPersonIdAsync(item.PersonId);
                        if (!string.IsNullOrEmpty(teamMember.EduEmail)) reportRecipients.Add(teamMember.EduEmail);
                        if (!string.IsNullOrEmpty(teamMember.ArmyEmail)) reportRecipients.Add(teamMember.ArmyEmail);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing team member {item.PersonId}: {ex.Message}");
                    }
                }

                await _graphHelper.SendEmailWithoutAttachmentAsync(reportTitle, reportBuilder.ToString(), reportRecipients.ToArray(), new string[] { });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Critical error in EmailNotificationJobAsync: {ex.Message}");
                throw;
            }
        }

    }
}
