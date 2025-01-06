using Application.Core;
using MediatR;
using Persistence;
using Domain;
using Application.Repository;

namespace Application.Administrators
{
    public class Create
    {
          public class Command : IRequest<Result<Unit>>
         {
            public AdministratorDTO AdministratorDTO  { get; set; }
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
                 var user = await _userService.GetUserByPersonIdAsync(request.AdministratorDTO.PersonId);

                 PrePublication_Administrator newAdministrator = new PrePublication_Administrator{
                    Id = request.AdministratorDTO.Id,
                    PersonId = request.AdministratorDTO.PersonId,
                    LastName = user.LastName,
                    FirstName = user.FirstName, 
                    MiddleName = user.MiddleName 
                 };

                 _context.Administrators.Add(newAdministrator);
                  var result = await _context.SaveChangesAsync() > 0;
                if (!result) return Result<Unit>.Failure("Failed to create administrator"); 
                return Result<Unit>.Success(Unit.Value);
            }
        }

    }
}