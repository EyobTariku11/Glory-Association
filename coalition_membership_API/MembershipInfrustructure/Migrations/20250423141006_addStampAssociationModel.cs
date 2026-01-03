using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class addStampAssociationModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SigniturePath",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StampPath",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StampPath2",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SigniturePath",
                table: "Associations");

            migrationBuilder.DropColumn(
                name: "StampPath",
                table: "Associations");

            migrationBuilder.DropColumn(
                name: "StampPath2",
                table: "Associations");
        }
    }
}
