using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Repository;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Attributes
{
    public class AuthorizeAdminAttribute : Attribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var serviceProvider = context.HttpContext.RequestServices;
            var usawcUserService = serviceProvider.GetService<IUSAWCUserService>();
            var dbContext = serviceProvider.GetService<DataContext>();

            if (usawcUserService == null || dbContext == null)
            {
                context.Result = new UnauthorizedObjectResult("Required services are unavailable.");
                return;
            }

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

            var usawcUser = await usawcUserService.GetUserByEmailAsync(email);

            if (usawcUser == null)
            {
                context.Result = new UnauthorizedObjectResult("Email not found in USAWC table.");
                return;
            }

            // Check if user is an admin
            var isAdmin = await dbContext.Administrators.AnyAsync(x => x.PersonId == usawcUser.PersonId);

            if (!isAdmin)
            {
                context.Result = new ForbidResult("User does not have admin privileges.");
                return;
            }
        }
    }
}