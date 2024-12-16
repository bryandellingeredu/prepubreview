﻿using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Publications
{
    public class List
    {
        public class Query : IRequest<Result<List<PrePublication_Publication>>>
        {
            public int Offset { get; set; } // Number of rows to skip
            public int Limit { get; set; } // Number of rows to return
        }

        public class Handler : IRequestHandler<Query, Result<List<PrePublication_Publication>>>
        {
            private readonly DataContext _context;

            public Handler(DataContext context)
            {
                _context = context;
            }

            public async Task<Result<List<PrePublication_Publication>>> Handle(Query request, CancellationToken cancellationToken) =>
                Result<List<PrePublication_Publication>>.Success(
                    await _context.Publications
                        .OrderByDescending(p => p.DateCreated)
                        .Skip(request.Offset)                   
                        .Take(request.Limit)     
                        .ToListAsync(cancellationToken)       
                );
        }
    }
}