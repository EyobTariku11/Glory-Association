using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class updateCycleModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberPayments_MembershipTypes_MembershipTypeId",
                table: "MemberPayments");

            migrationBuilder.DropIndex(
                name: "IX_MemberPayments_MembershipTypeId",
                table: "MemberPayments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_MemberPayments_MembershipTypeId",
                table: "MemberPayments",
                column: "MembershipTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberPayments_MembershipTypes_MembershipTypeId",
                table: "MemberPayments",
                column: "MembershipTypeId",
                principalTable: "MembershipTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
