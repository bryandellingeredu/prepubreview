using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class PrePublication_SecurityOfficer
    {
        public Guid Id { get; set; }
         public int PersonId { get; set; }

        public string FirstName{ get; set; } 
         public string MiddleName{ get; set; } 
        public string LastName{ get; set; } 

        public string Scip {get; set;}

        public string Title {get; set;}


    }
}