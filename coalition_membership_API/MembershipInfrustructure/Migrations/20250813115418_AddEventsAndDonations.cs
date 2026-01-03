using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MembershipInfrustructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEventsAndDonations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ETickets_Events_EventId",
                table: "ETickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Associations_AssociationModelId",
                table: "Events");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Events",
                table: "Events");

            migrationBuilder.RenameTable(
                name: "Events",
                newName: "ETicketEvents");

            migrationBuilder.RenameIndex(
                name: "IX_Events_AssociationModelId",
                table: "ETicketEvents",
                newName: "IX_ETicketEvents_AssociationModelId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ETicketEvents",
                table: "ETicketEvents",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "AssociationEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EventDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDonationEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TargetAmount = table.Column<double>(type: "float", nullable: true),
                    AmountCollected = table.Column<double>(type: "float", nullable: true),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssociationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssociationEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssociationEvents_Associations_AssociationId",
                        column: x => x.AssociationId,
                        principalTable: "Associations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventDonations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DonorName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Amount = table.Column<double>(type: "float", nullable: false),
                    TransactionReference = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPaid = table.Column<bool>(type: "bit", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MemberId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RowStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventDonations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventDonations_AssociationEvents_EventId",
                        column: x => x.EventId,
                        principalTable: "AssociationEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventDonations_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssociationEvents_AssociationId",
                table: "AssociationEvents",
                column: "AssociationId");

            migrationBuilder.CreateIndex(
                name: "IX_EventDonations_EventId",
                table: "EventDonations",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventDonations_MemberId",
                table: "EventDonations",
                column: "MemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_ETicketEvents_Associations_AssociationModelId",
                table: "ETicketEvents",
                column: "AssociationModelId",
                principalTable: "Associations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ETickets_ETicketEvents_EventId",
                table: "ETickets",
                column: "EventId",
                principalTable: "ETicketEvents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ETicketEvents_Associations_AssociationModelId",
                table: "ETicketEvents");

            migrationBuilder.DropForeignKey(
                name: "FK_ETickets_ETicketEvents_EventId",
                table: "ETickets");

            migrationBuilder.DropTable(
                name: "EventDonations");

            migrationBuilder.DropTable(
                name: "AssociationEvents");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ETicketEvents",
                table: "ETicketEvents");

            migrationBuilder.RenameTable(
                name: "ETicketEvents",
                newName: "Events");

            migrationBuilder.RenameIndex(
                name: "IX_ETicketEvents_AssociationModelId",
                table: "Events",
                newName: "IX_Events_AssociationModelId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Events",
                table: "Events",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ETickets_Events_EventId",
                table: "ETickets",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Associations_AssociationModelId",
                table: "Events",
                column: "AssociationModelId",
                principalTable: "Associations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
