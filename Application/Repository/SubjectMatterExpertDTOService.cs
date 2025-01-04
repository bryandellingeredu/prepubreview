using Domain;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;

namespace Application.Repository
{
    public class SubjectMatterExpertDTOService : ISubjectMatterExpertDTOService
    {
        private readonly IConfiguration _config;
        private readonly IMemoryCache _cache;
        private readonly IUSAWCUserService _userService;
        private readonly ISubjectService _subjectService;

        private static readonly string CacheKey = "UserWithSubjects";

        public SubjectMatterExpertDTOService(
            IConfiguration config, IMemoryCache cache, IUSAWCUserService userService, ISubjectService subjectService)
        {
            _config = config;
            _cache = cache;
            _userService = userService;
            _subjectService = subjectService;
        }

       public async Task<List<UserWithSubjectsDTO>> GetSubjectMatterExpertsDTOsAsync()
{
    if (_cache.TryGetValue(CacheKey, out List<UserWithSubjectsDTO> cachedData))
    {
        return cachedData;
    }

    var experts = new List<SubjectMatterExpertDTO>();

    var query = @"
        SELECT PersonId, SMESubjectId FROM [USAWCPersonnel].[SubjectMatterExperts].[smeEntries2] WHERE IsActive = 1
        UNION  
        SELECT PersonId, SMESubjectId FROM [USAWCPersonnel].[SubjectMatterExperts].[smeEntries] WHERE IsActive = 1";

    var connectionString = _config.GetConnectionString("USAWCPersonnelConnection");

    using (var connection = new SqlConnection(connectionString))
    {
        await connection.OpenAsync();
        using (var command = new SqlCommand(query, connection))
        using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                experts.Add(new SubjectMatterExpertDTO
                {
                    PersonId = reader.GetInt32(reader.GetOrdinal("PersonId")),
                    SMESubjectId = reader.GetInt32(reader.GetOrdinal("SMESubjectId")),
                });
            }
        }
    }

    // Fetch all USAWC users and subjects
    var usawcUsers = await _userService.GetUSAWCUsersAsync();
    var subjects = await _subjectService.GetSubjectsAsync();

    // Create a dictionary for quick lookup of subjects by PersonId
    var userSubjectsMap = experts
        .GroupBy(expert => expert.PersonId)
        .ToDictionary(
            group => group.Key,
            group => group
                .Select(expert => subjects.FirstOrDefault(subject => subject.SMESubjectId == expert.SMESubjectId)?.SMESubject)
                .Where(subjectName => !string.IsNullOrEmpty(subjectName))
                .Distinct()
                .OrderBy(subjectName => subjectName)
                .ToList()
        );

    // Map all USAWC users to UserWithSubjectsDTO, adding empty subject lists for non-experts
    var result = usawcUsers
        .Select(user => new UserWithSubjectsDTO
        {
            USAWCUser = user,
            Subjects = userSubjectsMap.ContainsKey(user.PersonId) ? userSubjectsMap[user.PersonId] : new List<string>()
        })
        .OrderBy(dto => dto.USAWCUser.LastName) // Optional: Order by last name
        .ToList();

    // Cache the result
    var cacheOptions = new MemoryCacheEntryOptions
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
    };
    _cache.Set(CacheKey, result, cacheOptions);

    return result;
}
    }
}
