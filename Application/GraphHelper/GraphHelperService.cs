﻿using Azure.Identity;
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

        public GraphHelperService(IConfiguration config)
        {
            _config = config;

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

public async Task<byte[]> DownloadFile( string itemId)
{
     string driveId = "b!n8q4TV01IUe4cvbyuYi8UdVKF2uJKVNMvasg_6b0i6XqCkIYuEEkTpEJFysR3WuK";
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
                // Drive ID for the Publications library
                string driveId = "b!n8q4TV01IUe4cvbyuYi8UdVKF2uJKVNMvasg_6b0i6XqCkIYuEEkTpEJFysR3WuK";

                // File name
                string fileName = file.FileName;
                fileName = fileName.Replace(":", "_").Replace("/", "_");

                // Create the request body for the upload session
                var requestBody = new CreateUploadSessionPostRequestBody
                {
                    Item = new DriveItemUploadableProperties
                    {
                        Name = fileName
                    }
                };

                // Create an upload session
                var uploadSession = await _appClient
                    .Drives[driveId]
                    .Root
                    .ItemWithPath(fileName)
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
