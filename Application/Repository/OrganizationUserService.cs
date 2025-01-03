using Domain;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;

namespace Application.Repository
{
    public class OrganizationUserService : IOrganizationUserService
    {
          private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;

        private static readonly string CacheKey = "OrganizationUsers";

           public OrganizationUserService(IConfiguration config, IMemoryCache cache)    
              {
                _config = config;
                _cache = cache;
             }

        public async Task<List<OrganizationUser>> GetOrganizationUsersAsync()
        {
             if (_cache.TryGetValue(CacheKey, out List<OrganizationUser> cachedOrganizationUsers))
              {
                return cachedOrganizationUsers;
              }

              var organizationUsers = new  List<OrganizationUser>();

              var query = @"
                SELECT distinct p.PersonId,  o.OrganizationID, o.OrganizationDisplay
                FROM [USAWCPersonnel].[Person].[Person] p
                JOIN [USAWCPersonnel].[Organization].[Positions_Persons] opp ON opp.PersonID = p.PersonID
                JOIN [USAWCPersonnel].[Organization].[Positions] op ON opp.PositionID = op.PositionID
                JOIN Organization.Organizations o ON op.OrganizationID = o.OrganizationID
              ";

               var connectionString = _config.GetConnectionString("USAWCPersonnelConnection");

                  using (var connection = new SqlConnection(connectionString))
                  {
                    await connection.OpenAsync();

                            using (var command = new SqlCommand(query, connection))
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                 while (await reader.ReadAsync())
                                 {
                                    organizationUsers.Add(new OrganizationUser{
                                       PersonId = reader.GetInt32(reader.GetOrdinal("PersonID")),
                                       OrganizationId = reader.GetInt32(reader.GetOrdinal("OrganizationID")),
                                       OrganizationDisplay = reader.GetString(reader.GetOrdinal("OrganizationDisplay"))
                                    });
                                 }
                            }
                  }
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            };
            _cache.Set(CacheKey, organizationUsers, cacheOptions);

            return organizationUsers;
        }
    }
}