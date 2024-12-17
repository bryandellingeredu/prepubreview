using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;

namespace Application.Repository
{
    public class USAWCUserService : IUSAWCUserService
    {
        private readonly IConfiguration _config;

        public USAWCUserService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<List<USAWCUser>> GetUSAWCUsersAsync()
        {
            var users = new List<USAWCUser>();

            // SQL query
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
                JOIN e ON p.PersonID = e.PersonID
                WHERE p.IsActive = 1 
                    AND (p.IsDeceased IS NULL OR p.IsDeceased = 0)
                GROUP BY 
                    p.PersonID, 
                    p.LastName, 
                    p.FirstName, 
                    p.MiddleName
                HAVING 
                    MAX(CASE WHEN e.EmailType = 'army' THEN e.Email END) IS NOT NULL
                    OR MAX(CASE WHEN e.EmailType = 'edu' THEN e.Email END) IS NOT NULL";

            // Get connection string from configuration
            var connectionString = _config.GetConnectionString("USAWCPersonnelConnection");

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand(query, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var user = new USAWCUser
                            {
                                PersonId = reader.GetInt32(reader.GetOrdinal("PersonID")),
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
                            };

                            users.Add(user);
                        }
                    }
                }
            }

            return users;
        }
    }
}
