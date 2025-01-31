using Application.Core;
using MediatR;
using Persistence;
using Domain;
using Application.Repository;

namespace Application.TeamMembers
{
    public class Create
    {
          public class Command : IRequest<Result<Unit>>
         {
            public TeamMemberDTO TeamMemberDTO  { get; set; }
         }

         
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
             private readonly DataContext _context;
             private readonly IUSAWCUserService _userService;

            public Handler(DataContext context, IUSAWCUserService userService)
            {
                _context = context;
                _userService = userService;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                 var user = await _userService.GetUserByPersonIdAsync(request.TeamMemberDTO.PersonId);

                 PrePublication_TeamMember newTeamMember = new PrePublication_TeamMember{
                    Id = request.TeamMemberDTO.Id,
                    PersonId = request.TeamMemberDTO.PersonId,
                    LastName = user.LastName,
                    FirstName = user.FirstName, 
                    MiddleName = user.MiddleName 
                 };

                 _context.TeamMembers.Add(newTeamMember);
                  var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to create team member"); 
                return Result<Unit>.Success(Unit.Value);
            }
        }

    }
}