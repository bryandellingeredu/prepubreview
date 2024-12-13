using Application.Core;
using Persistence;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace Application.AppUsers
{
    public class Login
    {
        // Update the IRequest type to return a Result containing the appUser
        public class Command : IRequest<Result<Domain.PrePublication_AppUser>>
        {
            public string Email { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Domain.PrePublication_AppUser>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Domain.PrePublication_AppUser>> Handle(Command request, CancellationToken cancellationToken)
            {
                // Check for the AppUser by email
                var appUser = await _context.AppUsers
                    .FirstOrDefaultAsync(x => x.Email.ToLower() == request.Email.ToLower(), cancellationToken);

                // If not found, attempt to create a new AppUser
                if (appUser == null)
                {
                    try
                    {
                        appUser = new Domain.PrePublication_AppUser { Email = request.Email.ToLower() };
                        _context.AppUsers.Add(appUser);
                        await _context.SaveChangesAsync(cancellationToken);
                    }
                    catch (DbUpdateException)
                    {
                        // Handle race condition: another request might have inserted the user
                        appUser = await _context.AppUsers
                            .FirstOrDefaultAsync(x => x.Email.ToLower() == request.Email.ToLower(), cancellationToken);

                        if (appUser == null)
                        {
                            // If appUser is still null, something unexpected happened
                            return Result<Domain.PrePublication_AppUser>.Failure("Failed to create or retrieve the AppUser.");
                        }
                    }
                }

                return Result<Domain.PrePublication_AppUser>.Success(appUser);
            }
        }
    }
}