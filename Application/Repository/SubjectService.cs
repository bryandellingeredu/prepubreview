
using Domain;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;

namespace Application.Repository
{
    public class SubjectService : ISubjectService
    {
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;

        private static readonly string CacheKey = "Subjects";

           public SubjectService(IConfiguration config, IMemoryCache cache)    
              {
                _config = config;
                _cache = cache;
                }
        public async Task<List<Subject>> GetSubjectsAsync()
        {
              if (_cache.TryGetValue(CacheKey, out List<Subject> cachedSubjects))
              {
                return cachedSubjects;
              }

              var subjects = new List<Subject>();
              
                var query = @"
                 SELECT [SMESubjectID]
                ,[SMECategoryID]
                ,[SMESubject]
                FROM [USAWCPersonnel].[SubjectMatterExperts].[SMESubjects]
                WHERE IsActive = 1
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
                            subjects.Add(new Subject{
                               SMECategoryId = reader.GetInt32(reader.GetOrdinal("SMECategoryID")),
                               SMESubjectId  = reader.GetInt32(reader.GetOrdinal("SMESubjectID")),
                               SMESubject = reader.GetString(reader.GetOrdinal("SMESubject")),
                            });  
                        }
                     }
                 }

            var cacheOptions = new MemoryCacheEntryOptions
              {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
               };
            _cache.Set(CacheKey, subjects, cacheOptions);

            return subjects;
        }
    }
}