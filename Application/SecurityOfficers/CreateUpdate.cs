using Application.Core;
using MediatR;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;
using Application.Repository;

namespace Application.SecurityOfficers
{
    public class CreateUpdate
    {
        public class Command : IRequest<Result<Unit>>{
            public PrePublication_SecurityOfficer PrePublication_SecurityOfficer {get; set;}
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                
                var existingSecurityOfficer = await _context.SecurityOfficers
                 .FirstOrDefaultAsync(x => x.Id == request.PrePublication_SecurityOfficer.Id);

                 if (existingSecurityOfficer != null) {
                    existingSecurityOfficer.PersonId = request.PrePublication_SecurityOfficer.PersonId;
                    existingSecurityOfficer.FirstName = request.PrePublication_SecurityOfficer.FirstName;
                    existingSecurityOfficer.MiddleName = request.PrePublication_SecurityOfficer.MiddleName;
                    existingSecurityOfficer.LastName = request.PrePublication_SecurityOfficer.LastName;
                    existingSecurityOfficer.Scip = request.PrePublication_SecurityOfficer.Scip;
                    existingSecurityOfficer.Title = request.PrePublication_SecurityOfficer.Title;
                    existingSecurityOfficer.OrganizationId =  request.PrePublication_SecurityOfficer.OrganizationId;
                    existingSecurityOfficer.OrganizationDisplay = request.PrePublication_SecurityOfficer.OrganizationDisplay;
                     try{
                        await _context.SaveChangesAsync();
                         return Result<Unit>.Success(Unit.Value);
                     }
                     catch (Exception ex){
                         return Result<Unit>.Failure($"An error occurred when trying to update the security officer: {ex.Message}");
                     }
                 } else {
                    PrePublication_SecurityOfficer newSecurityOfficer = new PrePublication_SecurityOfficer();
                    newSecurityOfficer.Id = request.PrePublication_SecurityOfficer.Id;
                    newSecurityOfficer.PersonId = request.PrePublication_SecurityOfficer.PersonId;
                    newSecurityOfficer.FirstName = request.PrePublication_SecurityOfficer.FirstName;
                    newSecurityOfficer.MiddleName = request.PrePublication_SecurityOfficer.MiddleName;
                    newSecurityOfficer.LastName = request.PrePublication_SecurityOfficer.LastName;
                    newSecurityOfficer.Scip = request.PrePublication_SecurityOfficer.Scip;
                    newSecurityOfficer.Title = request.PrePublication_SecurityOfficer.Title;
                    newSecurityOfficer.OrganizationId =  request.PrePublication_SecurityOfficer.OrganizationId;
                    newSecurityOfficer.OrganizationDisplay = request.PrePublication_SecurityOfficer.OrganizationDisplay;
                     _context.SecurityOfficers.Add(newSecurityOfficer);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to create security officer"); 
                        return Result<Unit>.Success(Unit.Value);
                 } 
            }
        }
    }
}