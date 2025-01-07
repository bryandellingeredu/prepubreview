using Azure.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Drives.Item.Items.Item.CreateUploadSession;

namespace Application.GraphHelper
{
    public class GraphHelperService : IGraphHelperService
    {
        private readonly IConfiguration _config;
        private readonly GraphServiceClient _appClient;
        private readonly string driveId;

        public GraphHelperService(IConfiguration config)
        {
            _config = config;
            driveId =  _config["GraphHelper:driveId"];
            var tenantId = _config["GraphHelper:TenantId"];
            var clientId = _config["GraphHelper:ClientId"];
            var clientSecret = _config["GraphHelper:ClientSecret"];

            if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                throw new InvalidOperationException("Graph configuration is missing.");
            }

            var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
            _appClient = new GraphServiceClient(credential, new[] { "https://graph.microsoft.com/.default" });
        }

 public async Task DeleteFile(string itemId)
{
    try
    {
        if (string.IsNullOrEmpty(driveId))
        {
            throw new ArgumentException("Drive ID cannot be null or empty.", nameof(driveId));
        }

        if (string.IsNullOrEmpty(itemId))
        {
            throw new ArgumentException("Item ID cannot be null or empty.", nameof(itemId));
        }

        await _appClient
            .Drives[driveId]
            .Items[itemId]
            .DeleteAsync();
    }
    catch (ServiceException ex)
    {
        // Log the exception or handle it as needed
        Console.Error.WriteLine($"Error deleting file: {ex.Message}");
        throw; // Re-throw if you want the caller to handle the exception
    }
}

        public async Task<byte[]> DownloadFile( string itemId)
{

    try
    {
        if (string.IsNullOrEmpty(driveId) || string.IsNullOrEmpty(itemId))
        {
            throw new ArgumentException("Drive ID and Item ID cannot be null or empty.");
        }

        // Get the file content as a stream from the DriveItem
        using (var stream = await _appClient
            .Drives[driveId]
            .Items[itemId]
            .Content
            .GetAsync())
        {
            // Read the stream into a byte array
            using (var memoryStream = new MemoryStream())
            {
                await stream.CopyToAsync(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
    catch (ServiceException ex)
    {
        throw new Exception($"Graph API error: {ex.Message}", ex);
    }
    catch (Exception ex)
    {
        throw new Exception($"An error occurred while downloading the file: {ex.Message}", ex);
    }
}

     public async Task<string> UploadFile(IFormFile file)
{
    try
    {
        // File name
        string originalFileName = file.FileName;
        string uniqueFileName = $"{Path.GetFileNameWithoutExtension(originalFileName)}_{DateTime.UtcNow:yyyyMMddHHmmss}{Path.GetExtension(originalFileName)}";

        // Sanitize the file name
        uniqueFileName = uniqueFileName.Replace(":", "_").Replace("/", "_");

        // Create the request body for the upload session
        var requestBody = new CreateUploadSessionPostRequestBody
        {
            Item = new DriveItemUploadableProperties
            {
                Name = uniqueFileName
            }
        };

        // Create an upload session
        var uploadSession = await _appClient
            .Drives[driveId]
            .Root
            .ItemWithPath(uniqueFileName)
            .CreateUploadSession
            .PostAsync(requestBody);

        if (uploadSession == null || string.IsNullOrEmpty(uploadSession.UploadUrl))
        {
            throw new Exception("Failed to create an upload session.");
        }

        // Upload the file in chunks
        using (var fileStream = file.OpenReadStream())
        {
            const int maxChunkSize = 320 * 1024; // 320 KB chunk size
            var fileUploadTask = new LargeFileUploadTask<DriveItem>(uploadSession, fileStream, maxChunkSize);

            var uploadResult = await fileUploadTask.UploadAsync();

            if (uploadResult.UploadSucceeded)
            {
                // Return the uploaded file's URL
                return uploadResult.ItemResponse.Id;
            }
            else
            {
                throw new Exception("File upload failed.");
            }
        }
    }
    catch (ServiceException ex)
    {
        throw new Exception($"Graph API error: {ex.Message}", ex);
    }
}
    }
}
