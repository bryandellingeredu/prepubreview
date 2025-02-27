using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class PrePublication_SMEPubLookup
    {
    public Guid Id { get; set; }
    public int SMEPersonId { get; set; }
    public Guid PublicationLookup {get; set; }
    }
}