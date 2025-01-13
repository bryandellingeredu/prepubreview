using Application.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace API.Attributes
{
    public class AuthorizeUSAWCEmailAttribute : Attribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            // Access the IUSAWCUserService
            var serviceProvider = context.HttpContext.RequestServices;
            var usawcUserService = serviceProvider.GetService<IUSAWCUserService>();

            if (usawcUserService == null)
            {
                context.Result = new UnauthorizedObjectResult("Authorization service unavailable.");
                return;
            }

            // Extract the email claim
            var email = context.HttpContext.User?.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")
                        ?? context.HttpContext.User?.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(email))
            {
                context.Result = new UnauthorizedObjectResult("No email claim found in the token.");
                return;
            }

            if(email.ToLower() == "bdellinger@hossrob.onmicrosoft.com" ){
                email = "bryan.d.dellinger.civ@army.mil";
            }

            // Fetch the cached email lookup from the repository
            var emailLookup = await usawcUserService.GetEmailLookupAsync();

            // Validate the email
            if (!emailLookup.ContainsKey(email))
            {
                context.Result = new UnauthorizedObjectResult("Email not found in USAWC table.");
                return;
            }

            // Optionally, attach the user object to HttpContext for downstream use
            context.HttpContext.Items["USAWCUser"] = emailLookup[email];
        }
    }
}