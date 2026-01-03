using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class addColorToAssociationModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PrimaryColor",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SecondaryColor",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrimaryColor",
                table: "Associations");

            migrationBuilder.DropColumn(
                name: "SecondaryColor",
                table: "Associations");
        }
    }
}
