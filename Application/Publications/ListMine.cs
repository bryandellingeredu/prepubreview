using Application.Core;
using Application.Repository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph.DeviceManagement.UserExperienceAnalyticsSummarizeWorkFromAnywhereDevices;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Publications
{
    public class ListMine
    {
        public class Query : IRequest<Result<List<PrePublication_Publication>>>
        {
            public string Email { get; set; } // Number of rows to skip
        }

        public class Handler : IRequestHandler<Query, Result<List<PrePublication_Publication>>>
        {
            private readonly DataContext _context;
            private readonly IUSAWCUserService _userService;

            public Handler(DataContext context, IUSAWCUserService userService)
            {
                _context = context;
                _userService = userService;
            }

            public async Task<Result<List<PrePublication_Publication>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var requestor = await _userService.GetUserByEmailAsync(request.Email);
                var publications = await _context.Publications
                                    .Where(
                                            x => x.AuthorPersonId == requestor.PersonId ||
                                            x.CreatedByPersonId == requestor.PersonId ||
                                            x.Threads.Any(thread => thread.AssignedToPersonId == requestor.PersonId)
                                           )
                                            .OrderBy(s => s.Status == StatusType.Complete ? 1 : 0) 
                                            .ThenByDescending(p => p.DateCreated)                 
                                            .ToListAsync();
                // If no data, add a single empty publication
                if (!publications.Any())
                {
                    publications.Add(new PrePublication_Publication
                    {
                        Id = Guid.Empty,
                        Title = "No Data Found",
                        DateCreated = DateTime.Now
                    });
                }

                return Result<List<PrePublication_Publication>>.Success(publications);
            }
        }

    }
}
