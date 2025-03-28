﻿using Domain;
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

        public DbSet<PrePublication_SecurityOfficer> SecurityOfficers{ get; set; }
        public DbSet<PrePublication_Administrator> Administrators{ get; set; }

        public DbSet<PrePublication_SMEThreadJunction> SMEThreadJunctions{ get; set; }

        public DbSet<PrePublication_TeamMember> TeamMembers{ get; set; }

        public DbSet<PrePublication_SMEPubLookup> SMEPubLookups{ get; set; }


    }

    
}