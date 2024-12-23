using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class PrePublication_AttachmentMetaData
    {
         public Guid Id { get; set; }
         public Guid AttachmentLookupId {get; set;}
         public Guid LookupId {get; set;}
        public string FileName { get; set; }
        public string FileType { get; set; }
    }
}