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
                TimeZoneInfo easternZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
                var author = await _userService.GetUserByPersonIdAsync(request.PublicationDTO.AuthorPersonId);
                var existingPublication = await _context.Publications
                    .Where(x => x.Id == request.PublicationDTO.Id)
                    .FirstOrDefaultAsync();

                    if (existingPublication != null){
                     existingPublication.Title = request.PublicationDTO.Title;
                     existingPublication.AuthorPersonId = request.PublicationDTO.AuthorPersonId; 
                     existingPublication.AuthorFirstName = author.FirstName; 
                     existingPublication.AuthorLastName = author.LastName;  
                     existingPublication.AuthorMiddleName = author.MiddleName; 
                     existingPublication.UpdatedByPersonId = request.PublicationDTO?.UpdatedByPersonId;
                     existingPublication.DateUpdated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone);
                     existingPublication.PublicationLink = request.PublicationDTO.PublicationLink;
                     existingPublication.PublicationLinkName = request.PublicationDTO.PublicationLinkName;
                     existingPublication.PromotedToPress = request.PublicationDTO.PromotedToPress;
                     existingPublication.PromotedToSocial = request.PublicationDTO.PromotedToSocial;
                     existingPublication.PromotedToWeb = request.PublicationDTO.PromotedToWeb;
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
                       newPublication.AuthorMiddleName = author.MiddleName; 
                       newPublication.DateCreated = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, easternZone);  
                       newPublication.CreatedByPersonId = request.PublicationDTO.CreatedByPersonId;
                       newPublication.PublicationLink = request.PublicationDTO.PublicationLink;
                       newPublication.PublicationLinkName = request.PublicationDTO.PublicationLinkName;
                       newPublication.Status = StatusType.Pending;
                       newPublication.LogicalDeleteIn = false;
                       newPublication.PromotedToPress = request.PublicationDTO.PromotedToPress;
                       newPublication.PromotedToSocial = request.PublicationDTO.PromotedToSocial;
                       newPublication.PromotedToWeb = request.PublicationDTO.PromotedToWeb;
                    _context.Publications.Add(newPublication);
                        var result = await _context.SaveChangesAsync() > 0;
                        if (!result) return Result<Unit>.Failure("Failed to create registration"); 
                        return Result<Unit>.Success(Unit.Value);
                    }
            }
        }

    }
}