using Domain; // For USAWCUser model
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;

namespace Application.Repository
{
    public class USAWCUserService : IUSAWCUserService
    {
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;

        private static readonly string CacheKey = "USAWCUsers";
        private static readonly string EmailLookupCacheKey = "USAWCEmailLookup";

        public USAWCUserService(IConfiguration config, IMemoryCache cache)
        {
            _config = config;
            _cache = cache;
        }

        public async Task<List<USAWCUser>> GetUSAWCUsersAsync()
        {
            // Return from cache if available
            if (_cache.TryGetValue(CacheKey, out List<USAWCUser> cachedUsers))
            {
                return cachedUsers;
            }

            var users = new List<USAWCUser>();

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

            var connectionString = _config.GetConnectionString("USAWCPersonnelConnection");

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand(query, connection))
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        users.Add(new USAWCUser
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

            // Cache the result
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            };
            _cache.Set(CacheKey, users, cacheOptions);

            return users;
        }

        public async Task<Dictionary<string, USAWCUser>> GetEmailLookupAsync()
        {
            // Return cached email lookup dictionary if available
            if (_cache.TryGetValue(EmailLookupCacheKey, out Dictionary<string, USAWCUser> emailLookup))
            {
                return emailLookup;
            }

            // Fetch users and build the lookup dictionary
            var users = await GetUSAWCUsersAsync();
            emailLookup = users
                .SelectMany(user => new[]
                {
                    new { Email = user.ArmyEmail, User = user },
                    new { Email = user.EduEmail, User = user }
                })
                .Where(entry => !string.IsNullOrEmpty(entry.Email))
                .ToDictionary(entry => entry.Email, entry => entry.User, StringComparer.OrdinalIgnoreCase);

            // Cache the lookup dictionary
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            };
            _cache.Set(EmailLookupCacheKey, emailLookup, cacheOptions);

            return emailLookup;
        }
    }
}