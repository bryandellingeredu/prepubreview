using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class securityofficer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SecurityOfficerId",
                table: "Threads",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SecurityOfficers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Scip = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityOfficers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Threads_SecurityOfficerId",
                table: "Threads",
                column: "SecurityOfficerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Threads_SecurityOfficers_SecurityOfficerId",
                table: "Threads",
                column: "SecurityOfficerId",
                principalTable: "SecurityOfficers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Threads_SecurityOfficers_SecurityOfficerId",
                table: "Threads");

            migrationBuilder.DropTable(
                name: "SecurityOfficers");

            migrationBuilder.DropIndex(
                name: "IX_Threads_SecurityOfficerId",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "SecurityOfficerId",
                table: "Threads");
        }
    }
}
