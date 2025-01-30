using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class logicalDeleteIn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateDeleted",
                table: "Publications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedByPersonId",
                table: "Publications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LogicalDeleteIn",
                table: "Publications",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateDeleted",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "DeletedByPersonId",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "LogicalDeleteIn",
                table: "Publications");
        }
    }
}
