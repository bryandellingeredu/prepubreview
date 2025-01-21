using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Threads
{
    public class SMEReviewThreadDTO
    {
        public Guid ThreadId {get; set;}
        public string Comments {get; set;}
        public string CommentsAsHtml {get; set;}
        public string ReviewStatus {get; set;}

    }
}