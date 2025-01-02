namespace Domain
{
  public class SubjectMatterExpertDTO{
      public int PersonId { get; set; }
      public int SMESubjectId {get; set; }

      public USAWCUser USAWCUser { get; set; }
      public List<Subject> Subjects { get; set; } 
  }
}