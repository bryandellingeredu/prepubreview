using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Publications
{
    public class PublicationListDTO
    {
         public int Offset { get; set; } = 0;
         public int Limit { get; set; } = 25;
         public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; } 
        public string Title { get; set; }
        public string Author { get; set; }
        public int? Status { get; set; } 
    }
}