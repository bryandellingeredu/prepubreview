using Domain;

namespace Application.Repository
{
    public interface IUSAWCUserService
    {
        Task<List<USAWCUser>> GetUSAWCUsersAsync();
        Task<Dictionary<string, USAWCUser>> GetEmailLookupAsync();
        Task<Dictionary<int, USAWCUser>> GetPersonIdLookupAsync();
        Task<USAWCUser> GetUserByPersonIdAsync(int personId);

    }
}