namespace Domain
{
        public enum ThreadType
    {
        Author,
        SME,
        OPSEC
    }
     public class PrePublication_Thread{
        public Guid Id { get; set; }
        public bool IsActive { get; set; }

         public int CreatedByPersonId { get; set; }
         public int? UpdatedByPersonId {get; set;}
        public DateTime DateCreated { get; set; } 
        public DateTime? DateUpdated { get; set; } 
         public string Comments { get; set; }
         public ThreadType Type { get; set; }

        public Guid? PublicationId { get; set; }

        public PrePublication_Publication Publication { get; set; }

         public ICollection<PrePublication_SubjectMatterExpert> SubjectMatterExperts { get; set; } = new List<PrePublication_SubjectMatterExpert>();
     }
}