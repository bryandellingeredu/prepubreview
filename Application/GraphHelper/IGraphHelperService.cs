using Domain;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Application.GraphHelper
{
    public interface IGraphHelperService
    {
        Task<string> UploadFile(IFormFile file);
        Task<Byte[]> DownloadFile(string itemId);
        Task DeleteFile(string itemId);
        Task SendEmailWithoutAttachmentAsync(string title, string body, string[] recipients, string[] carbonCopyRecipients);
    }
}
