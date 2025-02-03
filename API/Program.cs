using API.Extensions;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Persistence;
using System;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

// Add Hangfire services
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"), new SqlServerStorageOptions
    {
        CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
        SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
        QueuePollInterval = TimeSpan.FromSeconds(15), // Adjusted for better efficiency
        UseRecommendedIsolationLevel = true,
        DisableGlobalLocks = true
    }));

builder.Services.AddHangfireServer();
builder.Services.AddScoped<API.BackGroundJobs.BackGroundJobs>();

var app = builder.Build();

app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToController("Index", "Fallback");

// Ensure Hangfire Dashboard is added (optional)
app.UseHangfireDashboard();

// Scope for DI resolution
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    // Database migration
    var context = services.GetRequiredService<DataContext>();
    await context.Database.MigrateAsync();
    await Seed.SeedData(context, builder.Configuration.GetConnectionString("USAWCPersonnelConnection"));

    // Schedule recurring jobs
    var recurringJobManager = services.GetRequiredService<IRecurringJobManager>();
    var backgroundJobs = services.GetRequiredService<API.BackGroundJobs.BackGroundJobs>();

    recurringJobManager.AddOrUpdate(
    "EmailNotificationJob",
    () => backgroundJobs.EmailNotificationJob(),
    "0 18 * * 0-4" // Runs at 6 PM (18:00) UTC on Sunday to Thursday
);

}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during migration");
}

app.Run();
