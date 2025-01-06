using MediatR;
using Application.Core;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;
using Azure.Core;

namespace Application.Administrators
{
    public class Delete
    {
         public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

           public Handler(DataContext context) => _context = context;
  
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                try{
                  PrePublication_Administrator administrator = await _context.Administrators.FindAsync(request.Id, cancellationToken);  
                  _context.Administrators.Remove(administrator);
                   await _context.SaveChangesAsync(cancellationToken); 
                   return Result<Unit>.Success(Unit.Value);   
                }
                   catch (DbUpdateException dbEx)
                {
                    return Result<Unit>.Failure($"Database error occurred: {dbEx.Message}");
                }
                   catch (Exception ex)
                {
                    return Result<Unit>.Failure($"Unexpected error occurred: {ex.Message}");
                }
            }
        }
    }
}