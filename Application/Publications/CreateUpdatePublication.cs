using Application.Core;
using MediatR;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Domain;


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

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var existingPublication = await _context.Publications
                    .Where(x => x.Id == request.PublicationDTO.Id)
                    .FirstOrDefaultAsync();

                    if (existingPublication != null){
                     existingPublication.Title = request.PublicationDTO.Title;
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
                       newPublication.DateCreated = DateTime.Now;  
                        _context.Publications.Add(newPublication);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to create registration"); 
                        return Result<Unit>.Success(Unit.Value);
                    }
            }
        }

    }
}