using DMS_DOTNETREACT.DataModel;
using Microsoft.EntityFrameworkCore;

namespace DMS_DOTNETREACT.Data;

public class ClinicDbContext : DbContext
{
    public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options)
    {
    }
    public DbSet<User> Users => Set<User>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Secretary> Secretaries => Set<Secretary>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<MedicalNote> MedicalNotes => Set<MedicalNote>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<OffDay> OffDays => Set<OffDay>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Treatment> Treatments => Set<Treatment>();
    public DbSet<PatientTreatment> PatientTreatments => Set<PatientTreatment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Patient)
            .WithOne(p => p.User)
            .HasForeignKey<Patient>(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Doctor)
            .WithOne(d => d.User)
            .HasForeignKey<Doctor>(d => d.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Secretary)
            .WithOne(s => s.User)
            .HasForeignKey<Secretary>(s => s.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Doctor)
            .WithMany(d => d.Appointments)
            .HasForeignKey(a => a.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MedicalNote>()
            .HasOne(m => m.Doctor)
            .WithMany(d => d.MedicalNotes)
            .HasForeignKey(m => m.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MedicalNote>()
            .HasOne(m => m.Appointment)
            .WithMany(a => a.MedicalNotes)
            .HasForeignKey(m => m.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Appointment)
            .WithOne(a => a.Payment)
            .HasForeignKey<Payment>(p => p.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Secretary)
            .WithMany(s => s.Payments)
            .HasForeignKey(p => p.SecretaryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OffDay>()
            .HasOne(o => o.User)
            .WithMany(u => u.OffDays)
            .HasForeignKey(o => o.CreatedByUser)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PatientTreatment>()
            .HasOne(pt => pt.Patient)
            .WithMany(p => p.PatientTreatments)
            .HasForeignKey(pt => pt.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PatientTreatment>()
            .HasOne(pt => pt.Treatment)
            .WithMany(t => t.PatientTreatments)
            .HasForeignKey(pt => pt.TreatmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PatientTreatment>()
            .HasOne(pt => pt.Appointment)
            .WithMany()
            .HasForeignKey(pt => pt.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

