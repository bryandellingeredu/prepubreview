namespace Domain
{
      public class PrePublication_SubjectMatterExpert{
        public Guid Id { get; set; }
        public int PersonId { get; set; }
        public Guid? ThreadId { get; set; }
        public PrePublication_Thread Thread { get; set; }
      }
}