using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Threads
{
    public class InitialThreadDTO
    {
         public Guid Id { get; set; }
         public string Comments { get; set; }

         public string CommentsAsHTML {get; set;}

         public Guid PublicationId { get; set; }    

         public Guid SecurityOfficerId {get; set;}
         public List<int> SubjectMatterExpertIds {get; set;} 
         public Guid NextThreadId {get; set;}
         public int? SupervisorPersonId { get; set; }
    }
}