using API.Attributes;
using Application.TeamMembers;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class TeamMembersController : BaseApiController
    {
        [AuthorizeAdmin]
        [HttpGet] 
        public async Task<ActionResult<List<PrePublication_TeamMember>>> GetTeamMembers() =>
            HandleResult(await Mediator.Send(new List.Query {})); 

        [AuthorizeAdmin]
        [HttpPost]
        public async Task<IActionResult> CreateTeamMember([FromBody] TeamMemberDTO teamMemberDTO) =>
             HandleResult(await Mediator.Send(
                new Create.Command { TeamMemberDTO = teamMemberDTO }));

        [AuthorizeAdmin]
        [HttpDelete("{id}")] 
        public async Task<IActionResult> Delete(Guid id) =>
           HandleResult(await Mediator.Send(new Delete.Command { Id= id }));
 
    }
}