using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Services;

namespace DMS_DOTNETREACT.Helpers;

public static class DatabaseSeeder
{
    public static async Task SeedDatabase(ClinicDbContext context, PasswordHasher passwordHasher)
    {
        Console.WriteLine("Checking database seed status...");

        // 1. Seed Doctors if they don't exist
        if (!context.Doctors.Any())
        {
            Console.WriteLine("Seeding Doctors...");
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

            // Add off days
            var today = DateOnly.FromDateTime(DateTime.Today);
            var drSmithOffDays = new List<OffDay>
            {
                new OffDay { OffDate = today.AddDays(5), CreatedByUser = doctorUser1.Id, Reason = "Conference" },
                new OffDay { OffDate = today.AddDays(12), CreatedByUser = doctorUser1.Id, Reason = "Personal" },
                new OffDay { OffDate = today.AddDays(20), CreatedByUser = doctorUser1.Id, Reason = "Vacation" }
            };
            var drJohnsonOffDays = new List<OffDay>
            {
                new OffDay { OffDate = today.AddDays(3), CreatedByUser = doctorUser2.Id, Reason = "Training" },
                new OffDay { OffDate = today.AddDays(10), CreatedByUser = doctorUser2.Id, Reason = "Conference" },
                new OffDay { OffDate = today.AddDays(15), CreatedByUser = doctorUser2.Id, Reason = "Personal" }
            };
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
            Console.WriteLine("Doctors seeded.");
        }

        // 2. Seed Secretary if not exists
        if (!context.Users.Any(u => u.Username == "secretary1"))
        {
             Console.WriteLine("Seeding Secretary...");
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
             Console.WriteLine("Secretary seeded.");
        }

        // 3. Seed Treatments if not exist
        if (!context.Treatments.Any())
        {
            Console.WriteLine("Seeding Treatments...");
            var treatments = new List<Treatment>
            {
                new Treatment { Name = "General Dentistry", Description = "Checkups", Price = 150.00m, Icon = "🦷", IsActive = true },
                new Treatment { Name = "Cosmetic Dentistry", Description = "Whitening", Price = 300.00m, Icon = "😁", IsActive = true },
                new Treatment { Name = "Orthodontics", Description = "Braces", Price = 250.00m, Icon = "📐", IsActive = true },
                new Treatment { Name = "Dental Implants", Description = "Implants", Price = 500.00m, Icon = "💪", IsActive = true },
                new Treatment { Name = "Teeth Whitening", Description = "Whitening", Price = 200.00m, Icon = "✨", IsActive = true },
                new Treatment { Name = "Emergency Care", Description = "Urgent", Price = 180.00m, Icon = "⚠️", IsActive = true }
            };
            context.Treatments.AddRange(treatments);
            context.SaveChanges();
            Console.WriteLine("Treatments seeded.");
        }

        // 4. Seed Patients and Appointments (Basic check)
        if (!context.Patients.Any())
        {
            Console.WriteLine("Seeding Patients...");
            var patientUser = new User { Username = "testpatient", PasswordHash = passwordHasher.HashPassword("Patient123!"), Role = "patient", IsActive = true };
            context.Users.Add(patientUser);
            context.SaveChanges();

            var patient = new Patient { UserId = patientUser.Id, FullName = "John Doe", Phone = "555-9999", Gender = "Male", BirthDate = new DateOnly(1990, 5, 15) };
            context.Patients.Add(patient);
            context.SaveChanges();

            // Sample appointments require doctors and treatments to exist
            var doctor1 = context.Doctors.FirstOrDefault();
            if (doctor1 != null) 
            {
                var today = DateOnly.FromDateTime(DateTime.Today);
                var appt = new Appointment 
                { 
                    PatientId = patient.Id, 
                    DoctorId = doctor1.Id, 
                    AppointmentDate = today.AddDays(2), 
                    StartTime = new TimeOnly(10, 0), 
                    EndTime = new TimeOnly(10, 30),
                    Status = "Scheduled", 
                    Price = 150.00m, 
                    PaymentStatus = "paid" 
                };
                context.Appointments.Add(appt);
                context.SaveChanges();
            }
             Console.WriteLine("Patients seeded.");
        }
        

        // 5. Seed Admin User
        if (!context.Users.Any(u => u.Role == "admin"))
        {
            var adminUser = new User
            {
                Username = "admin1",
                PasswordHash = passwordHasher.HashPassword("Admin123!"),
                Role = "admin",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            Console.WriteLine("Admin user seeded.");
        }

        // 6. Seed System Settings
        if (!context.SystemSettings.Any())
        {
            context.SystemSettings.AddRange(
                new SystemSetting { Key = "ClinicName", Value = "DMS Health Center", Description = "Name of the clinic displayed in footer" },
                new SystemSetting { Key = "Address", Value = "123 Medical Center Dr, Health City, HC 90210", Description = "Physical address" },
                new SystemSetting { Key = "Phone", Value = "+1 (555) 123-4567", Description = "Contact phone number" },
                new SystemSetting { Key = "Email", Value = "contact@dmshealth.com", Description = "Contact email address" },
                new SystemSetting { Key = "FacebookUrl", Value = "https://facebook.com", Description = "Facebook link" },
                new SystemSetting { Key = "TwitterUrl", Value = "https://twitter.com", Description = "Twitter link" },
                new SystemSetting { Key = "InstagramUrl", Value = "https://instagram.com", Description = "Instagram link" }
            );
            await context.SaveChangesAsync();
            Console.WriteLine("System settings seeded.");
        }

        Console.WriteLine("Database seeding check complete.");
    }
}

