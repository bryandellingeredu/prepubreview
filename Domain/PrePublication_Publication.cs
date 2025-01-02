
namespace Domain
{
    public class PrePublication_Publication
    {
        public Guid Id { get; set; }

         public int CreatedByPersonId { get; set; }
         public int? UpdatedByPersonId {get; set;}
         public int AuthorPersonId { get; set; } 
         public string AuthorFirstName{ get; set; } 
         public string AuthorMiddleName{ get; set; } 
        public string AuthorLastName{ get; set; } 
        public string Title { get; set; } 
        public DateTime DateCreated { get; set; } 
        public DateTime? DateUpdated { get; set; } 
        public string PublicationLink {get; set;}
        public string PublicationLinkName {get; set;}

        public ICollection<PrePublication_Thread> Threads { get; set; } = new List<PrePublication_Thread>();
          
    }
}