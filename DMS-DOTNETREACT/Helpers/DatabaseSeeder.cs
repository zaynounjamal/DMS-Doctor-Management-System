using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Services;

namespace DMS_DOTNETREACT.Helpers;

public static class DatabaseSeeder
{
    public static void SeedDatabase(ClinicDbContext context, PasswordHasher passwordHasher)
    {
        // Check if we already have doctors
        try
        {
            if (context.Doctors.Any())
            {
                Console.WriteLine("Database already seeded.");
                return;
            }
        }
        catch
        {
            // Table doesn't exist yet or is empty, continue with seeding
        }

        Console.WriteLine("Seeding database with dummy data...");

        // Create doctor users
        var doctorUser1 = new User
        {
            Username = "dr.smith",
            PasswordHash = passwordHasher.HashPassword("Doctor123!"),
            Role = "doctor",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var doctorUser2 = new User
        {
            Username = "dr.johnson",
            PasswordHash = passwordHasher.HashPassword("Doctor123!"),
            Role = "doctor",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var doctorUser3 = new User
        {
            Username = "dr.williams",
            PasswordHash = passwordHasher.HashPassword("Doctor123!"),
            Role = "doctor",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(doctorUser1, doctorUser2, doctorUser3);
        context.SaveChanges();

        // Create doctor profiles
        var doctor1 = new Doctor
        {
            UserId = doctorUser1.Id,
            FullName = "Dr. Sarah Smith",
            Specialty = "Cardiology",
            Phone = "555-0101",
            StartHour = new TimeOnly(9, 0),
            EndHour = new TimeOnly(17, 0)
        };

        var doctor2 = new Doctor
        {
            UserId = doctorUser2.Id,
            FullName = "Dr. Michael Johnson",
            Specialty = "Pediatrics",
            Phone = "555-0102",
            StartHour = new TimeOnly(9, 0),
            EndHour = new TimeOnly(17, 0)
        };

        var doctor3 = new Doctor
        {
            UserId = doctorUser3.Id,
            FullName = "Dr. Emily Williams",
            Specialty = "Dermatology",
            Phone = "555-0103",
            StartHour = new TimeOnly(9, 0),
            EndHour = new TimeOnly(17, 0)
        };

        context.Doctors.AddRange(doctor1, doctor2, doctor3);
        context.SaveChanges();

        // Add off days for doctors (next 30 days)
        var today = DateOnly.FromDateTime(DateTime.Today);

        // Dr. Smith has off days on specific dates
        var drSmithOffDays = new List<OffDay>
        {
            new OffDay { OffDate = today.AddDays(5), CreatedByUser = doctorUser1.Id, Reason = "Conference" },
            new OffDay { OffDate = today.AddDays(12), CreatedByUser = doctorUser1.Id, Reason = "Personal" },
            new OffDay { OffDate = today.AddDays(20), CreatedByUser = doctorUser1.Id, Reason = "Vacation" }
        };

        // Dr. Johnson has off days
        var drJohnsonOffDays = new List<OffDay>
        {
            new OffDay { OffDate = today.AddDays(3), CreatedByUser = doctorUser2.Id, Reason = "Training" },
            new OffDay { OffDate = today.AddDays(10), CreatedByUser = doctorUser2.Id, Reason = "Conference" },
            new OffDay { OffDate = today.AddDays(15), CreatedByUser = doctorUser2.Id, Reason = "Personal" }
        };

        // Dr. Williams has off days
        var drWilliamsOffDays = new List<OffDay>
        {
            new OffDay { OffDate = today.AddDays(7), CreatedByUser = doctorUser3.Id, Reason = "Seminar" },
            new OffDay { OffDate = today.AddDays(14), CreatedByUser = doctorUser3.Id, Reason = "Personal" },
            new OffDay { OffDate = today.AddDays(21), CreatedByUser = doctorUser3.Id, Reason = "Vacation" }
        };

        context.OffDays.AddRange(drSmithOffDays);
        context.OffDays.AddRange(drJohnsonOffDays);
        context.OffDays.AddRange(drWilliamsOffDays);
        context.SaveChanges();

        // Create a test patient user (optional - for testing appointments)
        var patientUser = new User
        {
            Username = "testpatient",
            PasswordHash = passwordHasher.HashPassword("Patient123!"),
            Role = "patient",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(patientUser);
        context.SaveChanges();

        var patient = new Patient
        {
            UserId = patientUser.Id,
            FullName = "John Doe",
            Phone = "555-9999",
            Gender = "Male",
            BirthDate = new DateOnly(1990, 5, 15)
        };

        context.Patients.Add(patient);
        context.SaveChanges();

        // Create secretary user
        var secretaryUser = new User
        {
            Username = "secretary1",
            PasswordHash = passwordHasher.HashPassword("Secretary123!"),
            Role = "secretary",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(secretaryUser);
        context.SaveChanges();

        var secretary = new Secretary
        {
            UserId = secretaryUser.Id,
            FullName = "Sarah Johnson",
            Phone = "555-1234"
        };

        context.Secretaries.Add(secretary);
        context.SaveChanges();

        // Add more patients for testing
        var patient2User = new User
        {
            Username = "patient2",
            PasswordHash = passwordHasher.HashPassword("Patient123!"),
            Role = "patient",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var patient3User = new User
        {
            Username = "patient3",
            PasswordHash = passwordHasher.HashPassword("Patient123!"),
            Role = "patient",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(patient2User, patient3User);
        context.SaveChanges();

        var patient2 = new Patient
        {
            UserId = patient2User.Id,
            FullName = "Jane Smith",
            Phone = "555-8888",
            Gender = "Female",
            BirthDate = new DateOnly(1985, 8, 20)
        };

        var patient3 = new Patient
        {
            UserId = patient3User.Id,
            FullName = "Mike Wilson",
            Phone = "555-7777",
            Gender = "Male",
            BirthDate = new DateOnly(1992, 3, 10)
        };

        context.Patients.AddRange(patient2, patient3);
        context.SaveChanges();

        // Add 6 treatments
        var treatments = new List<Treatment>
        {
            new Treatment
            {
                Name = "General Dentistry",
                Description = "Comprehensive oral health care including cleanings, fillings, and preventive treatments.",
                Price = 150.00m,
                Icon = "🦷",
                IsActive = true
            },
            new Treatment
            {
                Name = "Cosmetic Dentistry",
                Description = "Transform your smile with teeth whitening, veneers, and smile makeovers.",
                Price = 300.00m,
                Icon = "😁",
                IsActive = true
            },
            new Treatment
            {
                Name = "Orthodontics",
                Description = "Straighten your teeth with modern braces and clear aligner treatments.",
                Price = 250.00m,
                Icon = "📐",
                IsActive = true
            },
            new Treatment
            {
                Name = "Dental Implants",
                Description = "Permanent tooth replacement solutions that look and feel natural.",
                Price = 500.00m,
                Icon = "💪",
                IsActive = true
            },
            new Treatment
            {
                Name = "Teeth Whitening",
                Description = "Professional whitening treatments for a brighter, more confident smile.",
                Price = 200.00m,
                Icon = "✨",
                IsActive = true
            },
            new Treatment
            {
                Name = "Emergency Care",
                Description = "24/7 emergency dental services for urgent dental issues and pain relief.",
                Price = 180.00m,
                Icon = "⚠️",
                IsActive = true
            }
        };

        context.Treatments.AddRange(treatments);
        context.SaveChanges();

        // Add some sample appointments with payment data
        var sampleAppointments = new List<Appointment>
        {
            new Appointment
            {
                PatientId = patient.Id,
                DoctorId = doctor1.Id,
                AppointmentDate = today.AddDays(2),
                AppointmentTime = new TimeOnly(10, 0),
                StartTime = new TimeOnly(10, 0),
                EndTime = new TimeOnly(10, 30),
                Status = "Scheduled",
                Notes = "Regular checkup",
                Price = 150.00m,
                PaymentStatus = "paid",
                CreatedAt = DateTime.UtcNow
            },
            new Appointment
            {
                PatientId = patient.Id,
                DoctorId = doctor1.Id,
                AppointmentDate = today.AddDays(2),
                AppointmentTime = new TimeOnly(14, 0),
                StartTime = new TimeOnly(14, 0),
                EndTime = new TimeOnly(14, 30),
                Status = "Scheduled",
                Notes = "Follow-up",
                Price = 100.00m,
                PaymentStatus = "unpaid",
                CreatedAt = DateTime.UtcNow
            },
            new Appointment
            {
                PatientId = patient.Id,
                DoctorId = doctor2.Id,
                AppointmentDate = today.AddDays(4),
                AppointmentTime = new TimeOnly(11, 0),
                StartTime = new TimeOnly(11, 0),
                EndTime = new TimeOnly(11, 30),
                Status = "Scheduled",
                Price = 200.00m,
                PaymentStatus = "paid",
                CreatedAt = DateTime.UtcNow
            },
            new Appointment
            {
                PatientId = patient.Id,
                DoctorId = doctor3.Id,
                AppointmentDate = today.AddDays(-5), // Past appointment
                AppointmentTime = new TimeOnly(9, 30),
                StartTime = new TimeOnly(9, 30),
                EndTime = new TimeOnly(10, 0),
                Status = "Scheduled",
                Notes = "Skin consultation",
                Price = 175.00m,
                PaymentStatus = "paid",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Appointment
            {
                PatientId = patient.Id,
                DoctorId = doctor2.Id,
                AppointmentDate = today.AddDays(-10), // Past appointment
                AppointmentTime = new TimeOnly(15, 0),
                StartTime = new TimeOnly(15, 0),
                EndTime = new TimeOnly(15, 30),
                Status = "Scheduled",
                Notes = "Vaccination",
                Price = 80.00m,
                PaymentStatus = "unpaid",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new Appointment
            {
                PatientId = patient.Id,
                DoctorId = doctor1.Id,
                AppointmentDate = today.AddDays(7),
                AppointmentTime = new TimeOnly(13, 0),
                StartTime = new TimeOnly(13, 0),
                EndTime = new TimeOnly(13, 30),
                Status = "Scheduled",
                Notes = "Blood pressure check",
                Price = 120.00m,
                PaymentStatus = "unpaid",
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Appointments.AddRange(sampleAppointments);
        context.SaveChanges();

        // Assign treatments to patients
        var patientTreatments = new List<PatientTreatment>
        {
            new PatientTreatment
            {
                PatientId = patient.Id,
                TreatmentId = treatments[0].Id, // General Dentistry
                Notes = "Regular checkup and cleaning",
                Status = "completed",
                AssignedDate = DateTime.UtcNow.AddDays(-30)
            },
            new PatientTreatment
            {
                PatientId = patient.Id,
                TreatmentId = treatments[4].Id, // Teeth Whitening
                Notes = "Requested whitening treatment",
                Status = "pending",
                AssignedDate = DateTime.UtcNow
            },
            new PatientTreatment
            {
                PatientId = patient2.Id,
                TreatmentId = treatments[2].Id, // Orthodontics
                Notes = "Braces consultation",
                Status = "pending",
                AssignedDate = DateTime.UtcNow
            },
            new PatientTreatment
            {
                PatientId = patient3.Id,
                TreatmentId = treatments[3].Id, // Dental Implants
                Notes = "Implant procedure scheduled",
                Status = "pending",
                AssignedDate = DateTime.UtcNow
            }
        };

        context.PatientTreatments.AddRange(patientTreatments);
        context.SaveChanges();

        Console.WriteLine("Database seeded successfully!");
        Console.WriteLine($"Created 3 doctors:");
        Console.WriteLine($"  - Dr. Sarah Smith (Cardiology) - Username: dr.smith, Password: Doctor123!");
        Console.WriteLine($"  - Dr. Michael Johnson (Pediatrics) - Username: dr.johnson, Password: Doctor123!");
        Console.WriteLine($"  - Dr. Emily Williams (Dermatology) - Username: dr.williams, Password: Doctor123!");
        Console.WriteLine($"Created 1 secretary:");
        Console.WriteLine($"  - Sarah Johnson - Username: secretary1, Password: Secretary123!");
        Console.WriteLine($"Created 3 test patients:");
        Console.WriteLine($"  - John Doe - Username: testpatient, Password: Patient123!");
        Console.WriteLine($"  - Jane Smith - Username: patient2, Password: Patient123!");
        Console.WriteLine($"  - Mike Wilson - Username: patient3, Password: Patient123!");
        Console.WriteLine($"Created {sampleAppointments.Count} sample appointments");
        Console.WriteLine($"Created {treatments.Count} treatments");
        Console.WriteLine($"Created {patientTreatments.Count} patient-treatment assignments");
        Console.WriteLine($"Financial Summary for test patient:");
        Console.WriteLine($"  - Total Paid: $525.00 (3 appointments)");
        Console.WriteLine($"  - Total Unpaid: $300.00 (3 appointments)");
        Console.WriteLine($"  - Total: $825.00");
    }
}
