using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DMS_DOTNETREACT.Migrations
{
    /// <inheritdoc />
    public partial class AddUserBlockingNoShowAndBlockedPhones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlockReason",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BlockedAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BlockedByUserId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBookingBlocked",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLoginBlocked",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "NoShowCount",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "BlockedPhoneNumbers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NormalizedPhone = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockedPhoneNumbers", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2025, 12, 18, 2, 5, 29, 722, DateTimeKind.Utc).AddTicks(7523));

            migrationBuilder.UpdateData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2025, 12, 18, 2, 5, 29, 722, DateTimeKind.Utc).AddTicks(9832));

            migrationBuilder.CreateIndex(
                name: "IX_BlockedPhoneNumbers_NormalizedPhone",
                table: "BlockedPhoneNumbers",
                column: "NormalizedPhone",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockedPhoneNumbers");

            migrationBuilder.DropColumn(
                name: "BlockReason",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BlockedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BlockedByUserId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsBookingBlocked",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsLoginBlocked",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NoShowCount",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2025, 12, 17, 17, 49, 53, 892, DateTimeKind.Utc).AddTicks(3882));

            migrationBuilder.UpdateData(
                table: "EmailTemplates",
                keyColumn: "Id",
                keyValue: 2,
                column: "LastUpdated",
                value: new DateTime(2025, 12, 17, 17, 49, 53, 892, DateTimeKind.Utc).AddTicks(5551));
        }
    }
}
