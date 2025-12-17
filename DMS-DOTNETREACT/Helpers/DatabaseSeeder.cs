using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.DataModel;
using DMS_DOTNETREACT.Services;
using Microsoft.EntityFrameworkCore;

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
                Email = "dr.smith@clinic.com",
                Role = "doctor",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var doctorUser2 = new User
            {
                Username = "dr.johnson",
                PasswordHash = passwordHasher.HashPassword("Doctor123!"),
                Email = "dr.johnson@clinic.com",
                Role = "doctor",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var doctorUser3 = new User
            {
                Username = "dr.williams",
                PasswordHash = passwordHasher.HashPassword("Doctor123!"),
                Email = "dr.williams@clinic.com",
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
                 Email = "secretary@clinic.com",
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
            var patientUser = new User { Username = "testpatient", PasswordHash = passwordHasher.HashPassword("Patient123!"), Email = "patient@example.com", Role = "patient", IsActive = true };
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

        // Ensure existing patients have an email for reminders
        var defaultEmail = "patient@example.com";
        var usersWithMissingEmail = await context.Users
            .Where(u => u.Role == "patient" && (u.Email == null || u.Email == ""))
            .ToListAsync();
        if (usersWithMissingEmail.Count > 0)
        {
            foreach (var u in usersWithMissingEmail)
            {
                u.Email = defaultEmail;
            }
            await context.SaveChangesAsync();
        }

        // Seed extra patients to generate better reports
        if (!context.Users.Any(u => u.Username == "seedpatient1"))
        {
            var seedPatients = new List<(string username, string fullName, string phone)>
            {
                ("seedpatient1", "Zaynoun Patient", "76558202"),
                ("seedpatient2", "Maya Ali", "555-2202"),
                ("seedpatient3", "Karim Haddad", "555-2203"),
                ("seedpatient4", "Nour Ahmed", "555-2204"),
                ("seedpatient5", "Rami Saad", "555-2205")
            };

            foreach (var (username, fullName, phone) in seedPatients)
            {
                var u = new User
                {
                    Username = username,
                    PasswordHash = passwordHasher.HashPassword("Patient123!"),
                    Email = defaultEmail,
                    Role = "patient",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(u);
                context.SaveChanges();

                context.Patients.Add(new Patient
                {
                    UserId = u.Id,
                    FullName = fullName,
                    Phone = phone
                });
                context.SaveChanges();
            }
        }
        

        // 5. Seed Admin User
        if (!context.Users.Any(u => u.Role == "admin"))
        {
            var adminUser = new User
            {
                Username = "admin1",
                PasswordHash = passwordHasher.HashPassword("Admin123!"),
                Email = "admin@clinic.com",
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
        // 7. Seed Email Templates
        if (!context.EmailTemplates.Any(t => t.Name == "WelcomeEmail"))
        {
             var welcomeTemplate = new EmailTemplate
             {
                 Name = "WelcomeEmail",
                 Subject = "Welcome to DMS Health Center!",
                 Body = "<h1>Welcome, {{FullName}}!</h1><p>Thank you for registering with us. Your username is <strong>{{UserName}}</strong>.</p><p>We look forward to seeing you.</p>",
                 Description = "Email sent to new patients upon registration",
                 LastUpdated = DateTime.UtcNow
             };
             context.EmailTemplates.Add(welcomeTemplate);
             await context.SaveChangesAsync();
             Console.WriteLine("Email templates seeded.");
        }

        // 8. Seed Payments (for testing payment reports)
        if (await context.Payments.CountAsync(p => p.PaymentDate >= DateTime.Today.AddDays(-30)) < 20)
        {
            var secretary = await context.Secretaries.FirstOrDefaultAsync();
            if (secretary != null)
            {
                // Create completed+paid appointments in the last 30 days to drive the report page
                var doctors = await context.Doctors.ToListAsync();
                var patients = await context.Patients.ToListAsync();
                var random = new Random();
                var paymentMethods = new[] { "Cash", "Card", "Insurance" };

                if (doctors.Count > 0 && patients.Count > 0)
                {
                    var createdAppointments = new List<Appointment>();
                    var createdPayments = new List<Payment>();

                    var startDay = DateOnly.FromDateTime(DateTime.Today.AddDays(-25));
                    for (var i = 0; i < 25; i++)
                    {
                        var day = startDay.AddDays(i);
                        var countForDay = random.Next(1, 3);

                        for (var j = 0; j < countForDay; j++)
                        {
                            var doctor = doctors[random.Next(doctors.Count)];
                            var patient = patients[random.Next(patients.Count)];

                            var hour = random.Next(9, 17);
                            var minute = random.Next(0, 2) == 0 ? 0 : 30;
                            var apptTime = new TimeOnly(hour, minute);
                            var startTime = apptTime;
                            var endTime = apptTime.AddMinutes(30);
                            var completedAt = day.ToDateTime(apptTime);
                            var amount = random.Next(50, 300);

                            var appt = new Appointment
                            {
                                PatientId = patient.Id,
                                DoctorId = doctor.Id,
                                AppointmentDate = day,
                                AppointmentTime = apptTime,
                                StartTime = startTime,
                                EndTime = endTime,
                                Status = "done",
                                IsCompleted = true,
                                CompletedAt = completedAt,
                                Price = amount,
                                FinalPrice = amount,
                                PaymentStatus = "paid"
                            };

                            createdAppointments.Add(appt);
                        }
                    }

                    context.Appointments.AddRange(createdAppointments);
                    await context.SaveChangesAsync();

                    foreach (var apt in createdAppointments)
                    {
                        var paidAt = apt.CompletedAt ?? apt.AppointmentDate.ToDateTime(apt.AppointmentTime);
                        createdPayments.Add(new Payment
                        {
                            AppointmentId = apt.Id,
                            SecretaryId = secretary.Id,
                            Amount = apt.FinalPrice ?? apt.Price ?? 0,
                            PaymentMethod = paymentMethods[random.Next(paymentMethods.Length)],
                            PaymentDate = paidAt,
                            PaidAt = paidAt
                        });
                    }

                    context.Payments.AddRange(createdPayments);
                    await context.SaveChangesAsync();
                    Console.WriteLine($"Seeded {createdPayments.Count} payment records for reports.");
                }

                // Also backfill payments for any completed+paid appointments without a Payment row
                var completedAppointments = await context.Appointments
                    .Include(a => a.Payment)
                    .Where(a => a.IsCompleted && a.PaymentStatus == "paid" && a.Payment == null)
                    .ToListAsync();

                if (completedAppointments.Any())
                {
                    var payments = new List<Payment>();
                    var random2 = new Random();
                    var paymentMethods2 = new[] { "Cash", "Card", "Insurance" };

                    foreach (var apt in completedAppointments)
                    {
                        var paidAt = apt.CompletedAt ?? apt.AppointmentDate.ToDateTime(apt.AppointmentTime);
                        payments.Add(new Payment
                        {
                            AppointmentId = apt.Id,
                            SecretaryId = secretary.Id,
                            Amount = apt.FinalPrice ?? apt.Price ?? 0,
                            PaymentMethod = paymentMethods2[random2.Next(paymentMethods2.Length)],
                            PaymentDate = paidAt,
                            PaidAt = paidAt
                        });
                    }

                    context.Payments.AddRange(payments);
                    await context.SaveChangesAsync();
                    Console.WriteLine($"Seeded {payments.Count} payment records.");
                }
                else
                {
                    Console.WriteLine("No completed appointments found to create payments for.");
                }
            }
            else
            {
                Console.WriteLine("No secretary found to assign payments to.");
            }
        }

        Console.WriteLine("Database seeding check complete.");
    }
}

