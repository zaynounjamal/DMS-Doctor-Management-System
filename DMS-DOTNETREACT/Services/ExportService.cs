using CsvHelper;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.Globalization;
using DMS_DOTNETREACT.DataModel;

namespace DMS_DOTNETREACT.Services;

public class ExportService
{
    public byte[] ExportToCsv(List<Appointment> appointments)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        // Write records
        var records = appointments.Select(a => new
        {
            Date = a.AppointmentDate.ToString("yyyy-MM-dd"),
            Time = a.AppointmentTime.ToString(),
            PatientName = a.Patient?.FullName ?? "N/A",
            PatientPhone = a.Patient?.Phone ?? "N/A",
            Status = a.IsCompleted ? "Completed" : a.Status,
            FinalPrice = a.FinalPrice?.ToString("F2") ?? "N/A",
            PaymentStatus = a.PaymentStatus ?? "N/A",
            CompletionNotes = a.CompletionNotes ?? "",
            Notes = a.Notes ?? ""
        });

        csv.WriteRecords(records);
        writer.Flush();
        return memoryStream.ToArray();
    }

    public byte[] ExportToPdf(List<Appointment> appointments, string doctorName)
    {
        using var memoryStream = new MemoryStream();
        var document = new Document(PageSize.A4.Rotate(), 25, 25, 30, 30);
        var writer = PdfWriter.GetInstance(document, memoryStream);
        
        document.Open();

        // Title
        var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
        var title = new Paragraph($"Appointments Report - {doctorName}\n\n", titleFont);
        title.Alignment = Element.ALIGN_CENTER;
        document.Add(title);

        // Date range
        var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);
        var dateRange = new Paragraph($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm}\n\n", dateFont);
        dateRange.Alignment = Element.ALIGN_CENTER;
        document.Add(dateRange);

        // Table
        var table = new PdfPTable(8);
        table.WidthPercentage = 100;
        table.SetWidths(new float[] { 12f, 10f, 20f, 15f, 12f, 12f, 12f, 15f });

        // Header
        var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
        var headers = new[] { "Date", "Time", "Patient", "Phone", "Status", "Price", "Payment", "Notes" };
        
        foreach (var header in headers)
        {
            var cell = new PdfPCell(new Phrase(header, headerFont));
            cell.BackgroundColor = new BaseColor(102, 126, 234);
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 5;
            table.AddCell(cell);
        }

        // Data
        var dataFont = FontFactory.GetFont(FontFactory.HELVETICA, 9);
        foreach (var apt in appointments.OrderBy(a => a.AppointmentDate).ThenBy(a => a.AppointmentTime))
        {
            table.AddCell(new Phrase(apt.AppointmentDate.ToString("yyyy-MM-dd"), dataFont));
            table.AddCell(new Phrase(apt.AppointmentTime.ToString(), dataFont));
            table.AddCell(new Phrase(apt.Patient?.FullName ?? "N/A", dataFont));
            table.AddCell(new Phrase(apt.Patient?.Phone ?? "N/A", dataFont));
            table.AddCell(new Phrase(apt.IsCompleted ? "Completed" : apt.Status, dataFont));
            table.AddCell(new Phrase(apt.FinalPrice?.ToString("C") ?? "N/A", dataFont));
            table.AddCell(new Phrase(apt.PaymentStatus ?? "N/A", dataFont));
            table.AddCell(new Phrase(apt.CompletionNotes ?? apt.Notes ?? "", dataFont));
        }

        document.Add(table);

        // Summary
        document.Add(new Paragraph("\n"));
        var summaryFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);
        var summary = new Paragraph("Summary\n", summaryFont);
        document.Add(summary);

        var totalAppointments = appointments.Count;
        var completedAppointments = appointments.Count(a => a.IsCompleted);
        var totalRevenue = appointments.Sum(a => a.FinalPrice ?? 0);
        var paidRevenue = appointments.Where(a => a.PaymentStatus == "paid").Sum(a => a.FinalPrice ?? 0);

        var summaryText = new Paragraph(
            $"Total Appointments: {totalAppointments}\n" +
            $"Completed: {completedAppointments}\n" +
            $"Total Revenue: {totalRevenue:C}\n" +
            $"Paid Revenue: {paidRevenue:C}\n",
            dataFont
        );
        document.Add(summaryText);

        document.Close();
        writer.Close();

        return memoryStream.ToArray();
    }
}
