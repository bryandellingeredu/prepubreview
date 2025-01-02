using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class UserWithSubjectsDTO
    {
          public USAWCUser USAWCUser { get; set; }
           public List<string> Subjects { get; set; }
    }
}