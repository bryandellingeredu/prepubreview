using System.ComponentModel.DataAnnotations.Schema;

namespace Domain
{
    public class PrePublication_SubjectMatterExpert
    {
        public Guid Id { get; set; }
        public int PersonId { get; set; }

       [NotMapped]
        public ICollection<PrePublication_Thread> Threads { get; set; } = new List<PrePublication_Thread>();

        public ICollection<PrePublication_SMEThreadJunction> SMEThreadJunctions {get; set;}
    }
}