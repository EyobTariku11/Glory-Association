using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAssociationIdToGeneralCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssociationId",
                table: "Members",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "AssociationId",
                table: "GeneralCodes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Members_AssociationId",
                table: "Members",
                column: "AssociationId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralCodes_AssociationId",
                table: "GeneralCodes",
                column: "AssociationId");

            migrationBuilder.AddForeignKey(
                name: "FK_GeneralCodes_Associations_AssociationId",
                table: "GeneralCodes",
                column: "AssociationId",
                principalTable: "Associations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Members_Associations_AssociationId",
                table: "Members",
                column: "AssociationId",
                principalTable: "Associations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GeneralCodes_Associations_AssociationId",
                table: "GeneralCodes");

            migrationBuilder.DropForeignKey(
                name: "FK_Members_Associations_AssociationId",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_Members_AssociationId",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_GeneralCodes_AssociationId",
                table: "GeneralCodes");

            migrationBuilder.DropColumn(
                name: "AssociationId",
                table: "Members");

            migrationBuilder.DropColumn(
                name: "AssociationId",
                table: "GeneralCodes");
        }
    }
}
