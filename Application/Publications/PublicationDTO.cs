using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Publications
{
    public class PublicationDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } 
        public int CreatedByPersonId { get; set; }
         public int? UpdatedByPersonId {get; set;}
         public int AuthorPersonId { get; set; }    
    }
}