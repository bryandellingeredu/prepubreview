﻿using Azure.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Drives.Item.Items.Item.CreateUploadSession;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;


namespace Application.GraphHelper
{
    public class GraphHelperService : IGraphHelperService
    {
        private readonly IHostEnvironment _hostEnvironment;
        private readonly IConfiguration _config;
        private readonly GraphServiceClient _appClient;
        private readonly string driveId;
        private readonly string serviceAccount;
        private readonly string[] developerEmails;

        public GraphHelperService(IConfiguration config, IHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
            _config = config;
            driveId =  _config["GraphHelper:driveId"];
            var tenantId = _config["GraphHelper:tenantId"];
            var clientId = _config["GraphHelper:clientId"];
            var clientSecret = _config["GraphHelper:clientSecret"];
            serviceAccount =_config["GraphHelper:serviceAccount"];
            developerEmails = [_config["GraphHelper:developerEdu"], _config["GraphHelper:developerArmy"]];
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

        public async Task SendEmailWithAttachmentAsync(string title, string body, string[] recipients, string[] carbonCopyRecipients,
            string fileName, string fileType, string itemId)
        {
             if (string.IsNullOrEmpty(driveId) || string.IsNullOrEmpty(itemId))
            {
                throw new ArgumentException("Drive ID and Item ID cannot be null or empty.");
            }

            var toRecipients = recipients.Select(email => new Recipient
            {
                EmailAddress = new EmailAddress { Address = email }
            }).ToList();

            if (_hostEnvironment.IsDevelopment())
            {
                toRecipients = developerEmails.Select(email => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = email }
                }).ToList();
            }

              // Create the CC list only if NOT in Development
            List<Recipient> ccRecipients = null;
            if (!_hostEnvironment.IsDevelopment() && carbonCopyRecipients != null)
            {
                ccRecipients = carbonCopyRecipients.Select(email => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = email }
                }).ToList();
            }

                 // Create the email message
            var message = new Message
            {
                Subject = title,
                Body = new ItemBody
                {
                    ContentType = BodyType.Html,
                    Content = body
                },
                ToRecipients = toRecipients
            };

            if (!_hostEnvironment.IsDevelopment() && carbonCopyRecipients != null)
            {
                message.CcRecipients = carbonCopyRecipients.Select(email => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = email }
                }).ToList();
            }


               // Get the file content as a stream from the DriveItem
            using (var stream = await _appClient
            .Drives[driveId]
            .Items[itemId]
            .Content
            .GetAsync())
            {
                // Read the stream into a byte array
                message.Attachments ??= new List<Attachment>();
                using (var memoryStream = new MemoryStream())
                 {
                    await stream.CopyToAsync(memoryStream);
                    byte[] contentBytes = memoryStream.ToArray();
                    var fileAttachment = new FileAttachment
                    {
                        // ODataType might not be necessary depending on your Graph SDK version
                        ContentBytes = contentBytes,
                        ContentType = fileType,
                        Name = fileName
                    };
                    message.Attachments.Add(fileAttachment);

                    Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody mailbody = new()
                    {
                        Message = message,
                        SaveToSentItems = false
                    };
                     try
                     {
                     // Send the email
                        await _appClient.Users[serviceAccount]
                        .SendMail
                        .PostAsync(mailbody);
                    }
                    catch (Exception ex)
                    {
                    // Handle the exception as needed
                    throw;
                    }
                 }
            }

        }

        public async Task SendEmailWithoutAttachmentAsync(string title, string body, string[] recipients, string[] carbonCopyRecipients)
        {
            // Create the ToRecipients list
            var toRecipients = recipients.Select(email => new Recipient
            {
                EmailAddress = new EmailAddress { Address = email }
            }).ToList();

            // Override recipients if in Development
            if (_hostEnvironment.IsDevelopment())
            {
                toRecipients = developerEmails.Select(email => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = email }
                }).ToList();
            }

            // Create the CC list only if NOT in Development
            List<Recipient> ccRecipients = null;
            if (!_hostEnvironment.IsDevelopment() && carbonCopyRecipients != null)
            {
                ccRecipients = carbonCopyRecipients.Select(email => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = email }
                }).ToList();
            }

            // Create the email message
            var message = new Message
            {
                Subject = title,
                Body = new ItemBody
                {
                    ContentType = BodyType.Html,
                    Content = body
                },
                ToRecipients = toRecipients
            };

            if (!_hostEnvironment.IsDevelopment() && carbonCopyRecipients != null)
            {
                message.CcRecipients = carbonCopyRecipients.Select(email => new Recipient
                {
                    EmailAddress = new EmailAddress { Address = email }
                }).ToList();
            }

            var mailbody = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
            {
                Message = message,
                SaveToSentItems = false
            };

            try
            {
                // Send the email
                await _appClient.Users[serviceAccount]
                    .SendMail
                    .PostAsync(mailbody);
            }
            catch (Exception ex)
            {
                // Handle the exception as needed
                throw;
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
