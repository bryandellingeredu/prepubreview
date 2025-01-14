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
            List<PrePublication_SecurityOfficer> securityOfficers = [
                new PrePublication_SecurityOfficer{PersonId = 341733, 
                FirstName = "Danette",
                MiddleName = null,
                LastName = "Lay",
                Scip = "SSL",
                Title = "ACL Lab Specialist",
                OrganizationDisplay = "ACL Lab (PVST/ACLL)",
                OrganizationId = 2270,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 355070, 
                FirstName = "Jeffrey",
                MiddleName = "P",
                LastName = "Bartels",
                Scip = "Chapel",
                Title = "Chaplin",
                OrganizationDisplay = "Religious Support (Chapel) (USAG/CHAPEL)",
                OrganizationId = 105,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 350118, 
                FirstName = "Stephanie",
                MiddleName = "D",
                LastName = "Crider",
                Scip = "SSI",
                Title = "Visual Information Specialist",
                OrganizationDisplay = "USAWC Press (SSI/USAWCP)",
                OrganizationId = 52,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 333113, 
                FirstName = "Joseph",
                MiddleName = "T",
                LastName = "White",
                Scip = "G2",
                Title = "USAWC G2 Security Officer",
                OrganizationDisplay = "Security (COS/G2)",
                OrganizationId = 28,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 321680, 
                FirstName = "Victor",
                MiddleName = null,
                LastName = "Schwartzmiller",
                Scip = "CIO",
                Title = "Instructional Systems Specialist",
                OrganizationDisplay = "Applications Development Branch (COS/CIO-G6/ESD/ADB)",
                OrganizationId = 2284,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 314660, 
                FirstName = "Jennifer",
                MiddleName = null,
                LastName = "Macklin",
                Scip = "DRM",
                Title = "Program and Management Analyst",
                OrganizationDisplay = "Manpower & Contracts Agreements Branch (COS/G8/MCAB)",
                OrganizationId = 224,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 347904, 
                FirstName = "David",
                MiddleName = null,
                LastName = "Crider",
                Scip = "AHEC",
                Title = "Supervisory Security Analyst",
                OrganizationDisplay = "Collections Department",
                OrganizationId = 2273,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 320233, 
                FirstName = "Thomas",
                MiddleName = "J",
                LastName = "Kardos",
                Scip = "SSI",
                Title = "Analyst / Manager",
                OrganizationDisplay = "Strategic Studies Institute and USAWC Press (SSI)",
                OrganizationId = 50,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 353223, 
                FirstName = "Nicole",
                MiddleName = "G",
                LastName = "Wallace",
                Scip = "AHEC",
                Title = "Librarian",
                OrganizationDisplay = "Academic Library Department",
                OrganizationId = 2272,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 355935, 
                FirstName = "AMY",
                MiddleName = null,
                LastName = "RICE",
                Scip = "SSL",
                Title = "Marketing Assistant",
                OrganizationDisplay = "FMWR NAF Support (USAG/FMWR/NS)",
                OrganizationId = 147,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 287808, 
                FirstName = "Roy",
                MiddleName = "D",
                LastName = "Carte",
                Scip = "G3",
                Title = "USAWC Antiterrorism Officer",
                OrganizationDisplay = "Operations (COS/G3)",
                OrganizationId = 29,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 333264, 
                FirstName = "Adam",
                MiddleName = "R.",
                LastName = "Morehouse",
                Scip = "G2",
                Title = "Supervisory Security Specialist",
                OrganizationDisplay = "Security (COS/G2)",
                OrganizationId = 28,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 346624, 
                FirstName = "Brian",
                MiddleName = "J",
                LastName = "Fickel",
                Scip = "USAWC PAO",
                Title = "Public Affairs / Legislative Liason",
                OrganizationDisplay = "Public Affairs and Legislative Liaison (PA/LL)",
                OrganizationId = 16,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 324639, 
                FirstName = "Frederick",
                MiddleName = "K",
                LastName = "Bower",
                Scip = "G3",
                Title = "Operations Officer",
                OrganizationDisplay = "Operations (COS/G3)",
                OrganizationId = 29,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 331628, 
                FirstName = "Robert",
                MiddleName = "D",
                LastName = "Martin",
                Scip = "USAWC PAO",
                Title = "Public Affairs Specialist",
                OrganizationDisplay = "Public Affairs and Legislative Liaison (PA/LL)",
                OrganizationId = 16,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 334310, 
                FirstName = "Lauren",
                MiddleName = "C/Cook",
                LastName = "O'Donnell",
                Scip = "SSL",
                Title = "Prof. of Military Spouses",
                OrganizationDisplay = "USAWC Provost (PVST)",
                OrganizationId = 18,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 347739, 
                FirstName = "Lisa",
                MiddleName = "Elaine",
                LastName = "Feasley",
                Scip = "MWR",
                Title = "Marketing Assistant",
                OrganizationDisplay = "FMWR NAF Support (USAG/FMWR/NS)",
                OrganizationId = 147,
                LogicalDeleteIndicator = false
                },
                new PrePublication_SecurityOfficer{PersonId = 352608, 
                FirstName = "Kelly",
                MiddleName = "J",
                LastName = "Stull",
                Scip = "Provost Officer",
                Title = "Program Technician",
                OrganizationDisplay = "Registrar (PVST/REGISTRAR)",
                OrganizationId = 38,
                LogicalDeleteIndicator = false
                },
            ];
            await context.SaveChangesAsync();
        }
    }
}