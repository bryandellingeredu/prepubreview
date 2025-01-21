using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
        public enum ThreadType
    {
        Author,
        SME,
        OPSEC,
        AuthorRevisionForSME,
        AuthorRevisionForOPSEC, 
    }
    public class PrePublication_Thread
{
    public Guid Id { get; set; }
    public bool IsActive { get; set; }
    public int CreatedByPersonId { get; set; }
    public int? UpdatedByPersonId { get; set; }
    public int? AssignedToPersonId {get; set;}
    public DateTime DateCreated { get; set; }
    public DateTime? DateUpdated { get; set; }
    public string Comments { get; set; }
    public string CommentsAsHTML { get; set; }
    public string PublicationReview {get; set;}
    public string ReviewStatus {get; set;}
    public ThreadType Type { get; set; }

    public Guid? PublicationId { get; set; }
    public PrePublication_Publication Publication { get; set; }

    public ICollection<PrePublication_SMEThreadJunction> SMEThreadJunctions {get; set;}

    [NotMapped]
    public ICollection<PrePublication_SubjectMatterExpert> SubjectMatterExperts { get; set; } = new List<PrePublication_SubjectMatterExpert>();

    // One-to-Many Relationship with Security Officer
    public Guid? SecurityOfficerId { get; set; }
    public PrePublication_SecurityOfficer? SecurityOfficer { get; set; }
}
}