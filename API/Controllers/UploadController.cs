using Microsoft.AspNetCore.Mvc;
using API.Attributes;
using Application.Uploads;
using Persistence;
using Application.GraphHelper;

namespace API.Controllers
{
    public class UploadController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly IGraphHelperService _graphHelperService;

        public UploadController(DataContext context, IGraphHelperService graphHelperService){
          _context = context;
          _graphHelperService = graphHelperService;

        }   
   

        [AuthorizeUSAWCEmail]
        [HttpPost]
        public async Task<IActionResult> Add(
            [FromForm] string lookupId,
            [FromForm] Add.Command command
            )
           {
            command.LookupId = Guid.Parse(lookupId);
            return HandleResult(await Mediator.Send(command));
            }

         [AuthorizeUSAWCEmail]
         [HttpGet("{id}")]
        public async Task<IActionResult> GetFile(Guid id)
        {   
            var metaData = await _context.AttachmentMetaDatas.FindAsync(id);
            var file = await _context.Attachments.FindAsync(metaData.AttachmentLookupId);
            if (file == null)  return NotFound();
            byte[] binaryData = await _graphHelperService.DownloadFile(file.ItemId);
           return File(binaryData, metaData.FileType, metaData.FileName);
        }
    }
}