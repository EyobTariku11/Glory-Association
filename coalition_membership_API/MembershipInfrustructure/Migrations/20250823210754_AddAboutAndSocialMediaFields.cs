using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAboutAndSocialMediaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "About",
                table: "Coalition",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Facebook",
                table: "Coalition",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Telegram",
                table: "Coalition",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TikTok",
                table: "Coalition",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "About",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Facebook",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Telegram",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TikTok",
                table: "Associations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "About",
                table: "Coalition");

            migrationBuilder.DropColumn(
                name: "Facebook",
                table: "Coalition");

            migrationBuilder.DropColumn(
                name: "Telegram",
                table: "Coalition");

            migrationBuilder.DropColumn(
                name: "TikTok",
                table: "Coalition");

            migrationBuilder.DropColumn(
                name: "About",
                table: "Associations");

            migrationBuilder.DropColumn(
                name: "Facebook",
                table: "Associations");

            migrationBuilder.DropColumn(
                name: "Telegram",
                table: "Associations");

            migrationBuilder.DropColumn(
                name: "TikTok",
                table: "Associations");
        }
    }
}
