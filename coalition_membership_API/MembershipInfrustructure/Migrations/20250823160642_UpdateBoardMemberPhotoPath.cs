using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBoardMemberPhotoPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PhotoUrl",
                table: "BoardMembers",
                newName: "PhotoPath");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PhotoPath",
                table: "BoardMembers",
                newName: "PhotoUrl");
        }
    }
}
