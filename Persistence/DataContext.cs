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

        public DbSet<PrePublication_AppUser> AppUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure unique constraint on Email
            modelBuilder.Entity<PrePublication_AppUser>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}