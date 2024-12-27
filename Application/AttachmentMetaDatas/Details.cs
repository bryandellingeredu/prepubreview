using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AttachmentMetaDatas
{
    public class Details
    {
         public class Query : IRequest<Result<PrePublication_AttachmentMetaData>>
          {
            public Guid LookupId { get; set; } 
           }

        public class Handler : IRequestHandler<Query, Result<PrePublication_AttachmentMetaData>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context) => _context = context;
         
            public async Task<Result<PrePublication_AttachmentMetaData>> Handle(Query request, CancellationToken cancellationToken){
                PrePublication_AttachmentMetaData metaData = await _context.AttachmentMetaDatas.Where(x =>x.LookupId == request.LookupId).FirstOrDefaultAsync();
                
                if(metaData == null){
                  metaData = new PrePublication_AttachmentMetaData();
                }

               return    Result<PrePublication_AttachmentMetaData>.Success(metaData);
            }
           
        }

    }
}