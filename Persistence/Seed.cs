using Domain;
using Bogus; // Add Bogus for generating random data
using System;
using Microsoft.Data.SqlClient;

namespace Persistence
{
    public class Seed
    {
        public static async Task SeedData(DataContext context, string connectionString )
        {
            // Check if data already exists
            if (context.Publications.Any()) return;

              var usawcUsers = new List<USAWCUser>();

                  var query = @"
                WITH e AS (
                    SELECT 
                        PersonID, 
                        Email,
                        CASE 
                            WHEN Email LIKE '%@army.mil' THEN 'army'
                            WHEN Email LIKE '%@armywarcollege.edu' THEN 'edu'
                        END AS EmailType
                    FROM [USAWCPersonnel].[Person].[Emails]
                    WHERE Email LIKE '%@army.mil' OR Email LIKE '%@armywarcollege.edu'
                )
                SELECT 
                    p.PersonID, 
                    p.LastName, 
                    p.FirstName, 
                    p.MiddleName, 
                    MAX(CASE WHEN e.EmailType = 'army' THEN e.Email END) AS ArmyEmail,
                    MAX(CASE WHEN e.EmailType = 'edu' THEN e.Email END) AS EduEmail
                FROM [USAWCPersonnel].[Person].[Person] p
                JOIN Security.PersonRole pr ON pr.PersonID = e.PersonID
                WHERE p.IsActive = 1 
                    AND (p.IsDeceased IS NULL OR p.IsDeceased = 0)
					AND pr.RoleID IN ( 1, 2, 5, 107 )
                GROUP BY 
                    p.PersonID, 
                    p.LastName, 
                    p.FirstName, 
                    p.MiddleName
                HAVING 
                    MAX(CASE WHEN e.EmailType = 'army' THEN e.Email END) IS NOT NULL
                    OR MAX(CASE WHEN e.EmailType = 'edu' THEN e.Email END) IS NOT NULL";



            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand(query, connection))
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {   
                             usawcUsers.Add(new USAWCUser
                        {
                            PersonId = reader.GetInt32(reader.GetOrdinal("PersonID")),
                            LastName = reader.GetString(reader.GetOrdinal("LastName")),
                            FirstName = reader.GetString(reader.GetOrdinal("FirstName")),
                            MiddleName = reader.IsDBNull(reader.GetOrdinal("MiddleName")) 
                                ? null 
                                : reader.GetString(reader.GetOrdinal("MiddleName")),
                            ArmyEmail = reader.IsDBNull(reader.GetOrdinal("ArmyEmail")) 
                                ? null 
                                : reader.GetString(reader.GetOrdinal("ArmyEmail")),
                            EduEmail = reader.IsDBNull(reader.GetOrdinal("EduEmail")) 
                                ? null 
                                : reader.GetString(reader.GetOrdinal("EduEmail"))
                        });
                    }
                }
            }   

            var faker = new Faker(); // Initialize Faker for random data generation
            var random = new Random(); // Random instance for custom date generation

            var publications = new List<PrePublication_Publication>();

            for (int i = 0; i < 5000; i++)
            {
                var createdBy = usawcUsers[random.Next(usawcUsers.Count)];
                var author = usawcUsers[random.Next(usawcUsers.Count)];

                publications.Add(new PrePublication_Publication
                {
                    Title = faker.Lorem.Sentence(5), // Generate a random title with 5 words
                    DateCreated = DateTime.UtcNow.AddDays(-random.Next(0, 5 * 365)), // Random date in the last 5 years
                    CreatedByPersonId = createdBy.PersonId, // Randomly pick a person ID
                    AuthorPersonId = author.PersonId,
                    AuthorFirstName = author.FirstName,
                    AuthorLastName = author.LastName,
                    AuthorMiddleName = author.MiddleName,
                });
            }

            // Add generated publications to the database context
            await context.Publications.AddRangeAsync(publications);
            await context.Administrators.AddAsync(new PrePublication_Administrator{ Id = new Guid(), PersonId = 351423, FirstName = "Bryan", MiddleName = "D", LastName = "Dellinger"});
            await context.SaveChangesAsync();
        }
    }
}