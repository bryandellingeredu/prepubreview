using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class PrePublication_SMEThreadJunction
    {
           public Guid Id { get; set; }

    // Foreign Key to Thread
    public Guid ThreadId { get; set; }
    public PrePublication_Thread Thread { get; set; }

    // Foreign Key to SubjectMatterExpert
    public Guid SubjectMatterExpertId { get; set; }
    public PrePublication_SubjectMatterExpert SubjectMatterExpert { get; set; }

    }
}