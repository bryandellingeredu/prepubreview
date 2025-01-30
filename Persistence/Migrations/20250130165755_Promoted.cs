using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Promoted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PromotedToPress",
                table: "Publications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PromotedToSocial",
                table: "Publications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PromotedToWeb",
                table: "Publications",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PromotedToPress",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "PromotedToSocial",
                table: "Publications");

            migrationBuilder.DropColumn(
                name: "PromotedToWeb",
                table: "Publications");
        }
    }
}
