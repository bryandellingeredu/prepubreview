using Application.Core;
using Application.GraphHelper;
using Application.Publications;
using Application.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Persistence;
using System.Text;


namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config )
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            services.AddDbContext<DataContext>(
                opt =>
                {
                    opt.UseSqlServer(config.GetConnectionString("DefaultConnection"));
                });

            services.AddCors(opt => {
                opt.AddPolicy("CorsPolicy", policy => {
                    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:3000");
                });
            });

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false; // Set to true in production with HTTPS
                options.SaveToken = true; // Save the token for potential retrieval

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidIssuer = "https://localhost:7274", // SSO server issuer
                    ValidAudience = "resource-server-1", // Expected audience
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecureRandomSecretKey123!"))
                };

                // Logging for detailed token validation diagnostics
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
                        {
                            Console.WriteLine("Authorization Header in OnMessageReceived: " + authHeader);
                        }
                        else
                        {
                            Console.WriteLine("No Authorization header found in OnMessageReceived.");
                        }
                        return Task.CompletedTask;
                    },

                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("Token validated successfully.");

                        // Log the entire JWT token if available
                        if (context.SecurityToken is System.IdentityModel.Tokens.Jwt.JwtSecurityToken jwtToken)
                        {
                            Console.WriteLine("Token: " + jwtToken.RawData);
                        }

                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        Console.WriteLine("Authentication challenge triggered.");

                        // Log all headers on challenge
                        foreach (var header in context.Request.Headers)
                        {
                            Console.WriteLine($"{header.Key}: {header.Value}");
                        }

                        // Check for the Authorization header
                        if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
                        {
                            Console.WriteLine("Authorization Header: " + authHeader);

                            // Extract and log the token part of the Authorization header
                            if (authHeader.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                            {
                                var token = authHeader.ToString().Substring("Bearer ".Length).Trim();
                                Console.WriteLine("Token on challenge: " + token);
                            }
                        }
                        else
                        {
                            Console.WriteLine("No Authorization header found.");
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            services.AddControllers(options =>
            {
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            });

            services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(List.Handler).Assembly));
            services.AddAutoMapper(typeof(MappingProfiles).Assembly);
            services.AddMemoryCache();
            services.AddScoped<IUSAWCUserService, USAWCUserService>();
            services.AddScoped<IGraphHelperService, GraphHelperService>();

            return services;

        }
    }
}
