using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<PrePublication_Publication> Publications { get; set; }
        public DbSet<PrePublication_Attachment> Attachments{ get; set; }
        public DbSet<PrePublication_AttachmentMetaData> AttachmentMetaDatas { get; set; }
        public DbSet<PrePublication_Thread> Threads{ get; set; }
        public DbSet<PrePublication_SubjectMatterExpert> SubjectMatterExperts{ get; set; }

    }
}