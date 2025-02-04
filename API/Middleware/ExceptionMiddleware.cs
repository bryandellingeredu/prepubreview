
using Azure.Identity;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using System.Net;
using System.Text;

namespace API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<Exception> _logger;
        private readonly IHostEnvironment _env;
        readonly IConfiguration _config;

        public ExceptionMiddleware(RequestDelegate next, ILogger<Exception> logger, IHostEnvironment env, IConfiguration config)
        {
            _next = next;
            _logger = logger;
            _env = env;
            _config = config;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                context.Request.EnableBuffering();
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                try
                {

                }
                catch (Exception)
                {
                    var headers = string.Join("\n", context.Request.Headers.Select(h => $"{h.Key}: {h.Value}"));
                    var requestBody = await ReadRequestBodyAsync(context);
                    var userClaims = context.User.Claims
                    .Select(c => $"{c.Type}: {c.Value}")
                    .ToList();

                    var claimsString = string.Join("\n", userClaims);

                    string body = $"Claims:\n{claimsString}\n" +  
                                  $"Time: {DateTime.Now}\n" +
                                  $"Error Message: {ex.Message}\n" +
                                  $"Stack Trace:\n{ex.StackTrace}\n" +
                                  $"Request Method: {context.Request.Method}\n" +
                                  $"Request URL: {context.Request.Path}{context.Request.QueryString}\n" +
                                  $"Request Headers:\n{headers}\n" +
                                  $"Request Body:\n{requestBody}\n";

                    if (ex.InnerException != null)
                    {
                        body += $"\nInner Exception Message: {ex.InnerException.Message}" +
                                $"\nInner Exception Stack Trace:\n{ex.InnerException.StackTrace}";
                    }

                    var tenantId = _config["GraphHelper:tenantId"];
                    var clientId = _config["GraphHelper:clientId"];
                    var clientSecret = _config["GraphHelper:clientSecret"];
                    var serviceAccount = _config["GraphHelper:serviceAccount"];
                    var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
                    GraphServiceClient _appClient = new GraphServiceClient(credential, new[] { "https://graph.microsoft.com/.default" });
                    var recipients = new string[] { "bryan.d.dellinger.civ@army.mil", "bryan.dellinger.civ@armywarcollege.edu" };

                    var toRecipients = recipients.Select(email => new Recipient
                    {
                        EmailAddress = new EmailAddress { Address = email }
                    }).ToList();

                    var message = new Message
                    {
                        Subject = "An Error Occured in the Pre Pub Application",
                        Body = new ItemBody
                        {
                            ContentType = BodyType.Html,
                            Content = body
                        },
                        ToRecipients = toRecipients
                    };

                    var mailbody = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
                    {
                        Message = message,
                        SaveToSentItems = false
                    };

                    try
                    {
                        await _appClient.Users[serviceAccount]
                        .SendMail
                        .PostAsync(mailbody);
                    }
                    catch (Exception)
                    {

                        throw;
                    }

                }
            }
          
        }

        private async Task<string> ReadRequestBodyAsync(HttpContext context)
        {
            context.Request.Body.Position = 0;

            if (context.Request.ContentLength == null || context.Request.ContentLength == 0)
            {
                return string.Empty;
            }

            using (var reader = new StreamReader(context.Request.Body, encoding: Encoding.UTF8, detectEncodingFromByteOrderMarks: false, bufferSize: 4096, leaveOpen: true))
            {
                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;
                return body;
            }
        }


    }
}
