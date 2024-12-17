using Domain;

namespace Application.Repository
{
    public interface IUSAWCUserService
    {
        Task<List<USAWCUser>> GetUSAWCUsersAsync();
    }
}