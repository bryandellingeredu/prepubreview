using Application.Core;
using MediatR;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;
using Application.Repository;


namespace Application.Publications
{
    public class CreateUpdatePublication
    {
         public class Command : IRequest<Result<Unit>>
         {
            public PublicationDTO PublicationDTO  { get; set; }
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
                var author = await _userService.GetUserByPersonIdAsync(request.PublicationDTO.AuthorPersonId);
                var existingPublication = await _context.Publications
                    .Where(x => x.Id == request.PublicationDTO.Id)
                    .FirstOrDefaultAsync();

                    if (existingPublication != null){
                     existingPublication.Title = request.PublicationDTO.Title;
                     existingPublication.AuthorPersonId = request.PublicationDTO.AuthorPersonId; 
                     existingPublication.AuthorFirstName = author.FirstName; 
                     existingPublication.AuthorLastName = author.LastName;  
                     existingPublication.AuthorLastName = author.MiddleName; 
                     existingPublication.UpdatedByPersonId = request.PublicationDTO?.UpdatedByPersonId;
                     existingPublication.DateUpdated = DateTime.Now;
                     try{
                        await _context.SaveChangesAsync();
                         return Result<Unit>.Success(Unit.Value);
                     }
                     catch (Exception ex){
                         return Result<Unit>.Failure($"An error occurred when trying to update the publication: {ex.Message}");
                     }
                   
                    }else{
                       PrePublication_Publication newPublication = new PrePublication_Publication();
                       newPublication.Id = request.PublicationDTO.Id;
                       newPublication.Title = request.PublicationDTO.Title; 
                       newPublication.AuthorPersonId = request.PublicationDTO.AuthorPersonId;
                       newPublication.AuthorFirstName = author.FirstName; 
                       newPublication.AuthorLastName = author.LastName;  
                       newPublication.AuthorLastName = author.MiddleName; 
                       newPublication.DateCreated = DateTime.Now;  
                       newPublication.CreatedByPersonId = request.PublicationDTO.CreatedByPersonId;
                    _context.Publications.Add(newPublication);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to create registration"); 
                        return Result<Unit>.Success(Unit.Value);
                    }
            }
        }

    }
}