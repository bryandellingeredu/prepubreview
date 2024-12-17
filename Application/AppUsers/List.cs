using Application.Core;
using Application.Repository;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.AppUsers
{
    public class List
    {
         public class Query : IRequest<Result<List<USAWCUser>>>
        {
          
        }

        public class Handler : IRequestHandler<Query, Result<List<USAWCUser>>>
        {
              private readonly IUSAWCUserService _usawcUserService;

            public Handler(IUSAWCUserService usawcUserService)
            {
                _usawcUserService = usawcUserService;
            }

            public async Task<Result<List<USAWCUser>>> Handle(Query request, CancellationToken cancellationToken) =>
                Result<List<USAWCUser>>.Success(await _usawcUserService.GetUSAWCUsersAsync());
            
           }
      }
}