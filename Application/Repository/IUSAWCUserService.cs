using Domain;

namespace Application.Repository
{
    public interface IUSAWCUserService
    {
        Task<List<USAWCUser>> GetUSAWCUsersAsync();
        Task<Dictionary<string, USAWCUser>> GetEmailLookupAsync();
    }
}