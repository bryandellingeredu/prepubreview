using Domain;
using Bogus; // Add Bogus for generating random data
using System;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context)
        {
            // Check if data already exists
            if (context.Publications.Any()) return;

            var faker = new Faker(); // Initialize Faker for random data generation
            var random = new Random(); // Random instance for custom date generation

            var publications = new List<PrePublication_Publication>();

            for (int i = 0; i < 5000; i++)
            {
                publications.Add(new PrePublication_Publication
                {
                    Title = faker.Lorem.Sentence(5), // Generate a random title with 5 words
                    DateCreated = DateTime.UtcNow.AddDays(-random.Next(0, 5 * 365)) // Random date in the last 5 years
                });
            }

            // Add generated publications to the database context
            await context.Publications.AddRangeAsync(publications);
            await context.SaveChangesAsync();
        }
    }
}