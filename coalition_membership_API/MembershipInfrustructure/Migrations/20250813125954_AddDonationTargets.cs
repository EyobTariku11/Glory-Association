using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationTargets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DonationTargetId",
                table: "EventDonations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DonationTargets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TargetAmount = table.Column<double>(type: "float", nullable: false),
                    AmountCollected = table.Column<double>(type: "float", nullable: true),
                    AssociationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonationTargets_AssociationEvents_EventId",
                        column: x => x.EventId,
                        principalTable: "AssociationEvents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DonationTargets_Associations_AssociationId",
                        column: x => x.AssociationId,
                        principalTable: "Associations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventDonations_DonationTargetId",
                table: "EventDonations",
                column: "DonationTargetId");

            migrationBuilder.CreateIndex(
                name: "IX_DonationTargets_AssociationId",
                table: "DonationTargets",
                column: "AssociationId");

            migrationBuilder.CreateIndex(
                name: "IX_DonationTargets_EventId",
                table: "DonationTargets",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_EventDonations_DonationTargets_DonationTargetId",
                table: "EventDonations",
                column: "DonationTargetId",
                principalTable: "DonationTargets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventDonations_DonationTargets_DonationTargetId",
                table: "EventDonations");

            migrationBuilder.DropTable(
                name: "DonationTargets");

            migrationBuilder.DropIndex(
                name: "IX_EventDonations_DonationTargetId",
                table: "EventDonations");

            migrationBuilder.DropColumn(
                name: "DonationTargetId",
                table: "EventDonations");
        }
    }
}
