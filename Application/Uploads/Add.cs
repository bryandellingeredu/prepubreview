using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Http;
using Persistence;
using Domain;
using Microsoft.EntityFrameworkCore;
using Application.GraphHelper;


namespace Application.Uploads
{
    public class Add
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid LookupId { get; set; }
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            public Handler(
             DataContext context, IGraphHelperService graphHelperService)
            {
                _context = context;
                _graphHelperService = graphHelperService;
            }

            private readonly DataContext _context;
            private readonly IGraphHelperService  _graphHelperService;

         public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
{
    try
    {
       string itemId = await _graphHelperService.UploadFile(request.File);
       var attachment = new PrePublication_Attachment { ItemId = itemId };
       await _context.Attachments.AddAsync(attachment);
       await _context.SaveChangesAsync();
       
       var existingAttachmentMetaData = await _context.AttachmentMetaDatas
                .Where(x => x.LookupId == request.LookupId)
                .FirstOrDefaultAsync();

            if (existingAttachmentMetaData != null)
            {
                existingAttachmentMetaData.AttachmentLookupId = attachment.Id;
                existingAttachmentMetaData.FileName = request.File.FileName;
                existingAttachmentMetaData.FileType = request.File.ContentType;
                await _context.SaveChangesAsync();
                return Result<Unit>.Success(Unit.Value);
            }
            else
            {
                var newAttachmentMetaData = new PrePublication_AttachmentMetaData
                {
                    LookupId = request.LookupId,
                    AttachmentLookupId = attachment.Id,
                    FileType = request.File.ContentType,
                    FileName = request.File.FileName,
                };
                _context.AttachmentMetaDatas.Add(newAttachmentMetaData);
                await _context.SaveChangesAsync();
                return Result<Unit>.Success(Unit.Value);
            }
        }
    
    catch (Exception ex)
    {
        return Result<Unit>.Failure($"Failed to Upload Publication: {ex.Message}");
    }
}
        }
    }
}
