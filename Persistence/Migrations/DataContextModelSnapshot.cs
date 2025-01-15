﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Persistence;

#nullable disable

namespace Persistence.Migrations
{
    [DbContext(typeof(DataContext))]
    partial class DataContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Domain.PrePublication_Administrator", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("FirstName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LastName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("MiddleName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("PersonId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Administrators");
                });

            modelBuilder.Entity("Domain.PrePublication_Attachment", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("ItemId")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Attachments");
                });

            modelBuilder.Entity("Domain.PrePublication_AttachmentMetaData", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("AttachmentLookupId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("FileName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("FileType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("LookupId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.ToTable("AttachmentMetaDatas");
                });

            modelBuilder.Entity("Domain.PrePublication_Publication", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("AuthorFirstName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("AuthorLastName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("AuthorMiddleName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("AuthorPersonId")
                        .HasColumnType("int");

                    b.Property<int>("CreatedByPersonId")
                        .HasColumnType("int");

                    b.Property<DateTime>("DateCreated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DateUpdated")
                        .HasColumnType("datetime2");

                    b.Property<string>("PublicationLink")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PublicationLinkName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("UpdatedByPersonId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Publications");
                });

            modelBuilder.Entity("Domain.PrePublication_SMEThreadJunction", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("SubjectMatterExpertId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("ThreadId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.HasIndex("SubjectMatterExpertId");

                    b.HasIndex("ThreadId");

                    b.ToTable("SMEThreadJunctions");
                });

            modelBuilder.Entity("Domain.PrePublication_SecurityOfficer", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("FirstName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LastName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("LogicalDeleteIndicator")
                        .HasColumnType("bit");

                    b.Property<string>("MiddleName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("OrganizationDisplay")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("OrganizationId")
                        .HasColumnType("int");

                    b.Property<int>("PersonId")
                        .HasColumnType("int");

                    b.Property<string>("Scip")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("SecurityOfficers");
                });

            modelBuilder.Entity("Domain.PrePublication_SubjectMatterExpert", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("PersonId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("SubjectMatterExperts");
                });

            modelBuilder.Entity("Domain.PrePublication_Thread", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Comments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CommentsAsHTML")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("CreatedByPersonId")
                        .HasColumnType("int");

                    b.Property<DateTime>("DateCreated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DateUpdated")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<Guid?>("PublicationId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid?>("SecurityOfficerId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.Property<int?>("UpdatedByPersonId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("PublicationId");

                    b.HasIndex("SecurityOfficerId");

                    b.ToTable("Threads");
                });

            modelBuilder.Entity("Domain.PrePublication_SMEThreadJunction", b =>
                {
                    b.HasOne("Domain.PrePublication_SubjectMatterExpert", "SubjectMatterExpert")
                        .WithMany("SMEThreadJunctions")
                        .HasForeignKey("SubjectMatterExpertId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Domain.PrePublication_Thread", "Thread")
                        .WithMany("SMEThreadJunctions")
                        .HasForeignKey("ThreadId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SubjectMatterExpert");

                    b.Navigation("Thread");
                });

            modelBuilder.Entity("Domain.PrePublication_Thread", b =>
                {
                    b.HasOne("Domain.PrePublication_Publication", "Publication")
                        .WithMany("Threads")
                        .HasForeignKey("PublicationId");

                    b.HasOne("Domain.PrePublication_SecurityOfficer", "SecurityOfficer")
                        .WithMany()
                        .HasForeignKey("SecurityOfficerId");

                    b.Navigation("Publication");

                    b.Navigation("SecurityOfficer");
                });

            modelBuilder.Entity("Domain.PrePublication_Publication", b =>
                {
                    b.Navigation("Threads");
                });

            modelBuilder.Entity("Domain.PrePublication_SubjectMatterExpert", b =>
                {
                    b.Navigation("SMEThreadJunctions");
                });

            modelBuilder.Entity("Domain.PrePublication_Thread", b =>
                {
                    b.Navigation("SMEThreadJunctions");
                });
#pragma warning restore 612, 618
        }
    }
}
