using System.Security.Cryptography.X509Certificates;
using Application.Core;
using Application.GraphHelper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Persistence;

namespace Application.AttachmentMetaDatas
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid LookupId { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IGraphHelperService _graphHelperService;

            public Handler(DataContext context, IGraphHelperService graphHelperService)
            {
                _context = context;
                _graphHelperService = graphHelperService;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try
                {
                    // Fetch metadata
                    var metaData = await _context.AttachmentMetaDatas
                        .FirstOrDefaultAsync(x => x.LookupId == request.LookupId, cancellationToken);

                    if (metaData == null)
                    {
                        return Result<Unit>.Failure("Attachment metadata not found.");
                    }

                    // Fetch attachment
                    var attachment = await _context.Attachments
                        .FindAsync(new object[] { metaData.AttachmentLookupId }, cancellationToken);

                    if (attachment == null)
                    {
                        return Result<Unit>.Failure("Attachment not found.");
                    }

                    // Delete file from Graph API
                    await _graphHelperService.DeleteFile(attachment.ItemId);

                    // Remove from database
                    _context.AttachmentMetaDatas.Remove(metaData);
                    _context.Attachments.Remove(attachment);

                    // Save changes
                    await _context.SaveChangesAsync(cancellationToken);

                    return Result<Unit>.Success(Unit.Value);
                }
                catch (DbUpdateException dbEx)
                {
                    return Result<Unit>.Failure($"Database error occurred: {dbEx.Message}");
                }
                catch (ServiceException graphEx)
                {
                    return Result<Unit>.Failure($"Graph API error occurred: {graphEx.Message}");
                }
                catch (Exception ex)
                {
                    return Result<Unit>.Failure($"Unexpected error occurred: {ex.Message}");
                }
            }
        }
    }
}