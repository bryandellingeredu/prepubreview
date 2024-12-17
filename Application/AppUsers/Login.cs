using Application.Core;
using MediatR;
using Application.Repository;

namespace Application.AppUsers
{
    public class Login
    {
        // Command to handle login request
        public class Command : IRequest<Result<Domain.USAWCUser>>
        {
            public string Email { get; set; }
        }

        // Handler for the login command
        public class Handler : IRequestHandler<Command, Result<Domain.USAWCUser>>
        {
            private readonly IUSAWCUserService _usawcUserService;

            public Handler(IUSAWCUserService usawcUserService)
            {
                _usawcUserService = usawcUserService;
            }

            public async Task<Result<Domain.USAWCUser>> Handle(Command request, CancellationToken cancellationToken)
            {
                // Fetch the cached email lookup from the repository
                var emailLookup = await _usawcUserService.GetEmailLookupAsync();

                if (!emailLookup.TryGetValue(request.Email, out var usawcUser))
                {
                    return Result<Domain.USAWCUser>.Failure("Email not found in USAWC table.");
                }

                return Result<Domain.USAWCUser>.Success(usawcUser);
            }
        }
    }
}