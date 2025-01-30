using System.Runtime.CompilerServices;
using Application.Core;
using Application.Repository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Publications
{
    public class Delete
    {
          public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
            public string Email {get; set;}
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
                TimeZoneInfo easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
                var deleter = await _userService.GetUserByEmailAsync(request.Email);

                  var existingPublication = await _context.Publications
                    .Where(x => x.Id == request.Id)
                    .FirstOrDefaultAsync();

                   existingPublication.LogicalDeleteIn = true;
                   existingPublication.DateDeleted =  TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone);
                   existingPublication.DeletedByPersonId = deleter.PersonId;

                     try{
                        await _context.SaveChangesAsync();
                         return Result<Unit>.Success(Unit.Value);
                     }
                     catch (Exception ex){
                         return Result<Unit>.Failure($"An error occurred when trying to delete the publication: {ex.Message}");
                     }
              }
        };
    }
}