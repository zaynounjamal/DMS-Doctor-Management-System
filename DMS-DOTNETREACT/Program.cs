using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.Services;
using DMS_DOTNETREACT.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddHttpContextAccessor();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<ClinicDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register custom services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<ExportService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AuditService>();
builder.Services.AddHostedService<NotificationBackgroundService>();

// JWT Authentication with validation
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] 
    ?? throw new InvalidOperationException("JWT SecretKey is not configured");

// Validate secret key length for security
if (jwtSecretKey.Length < 32)
{
    throw new InvalidOperationException("JWT SecretKey must be at least 32 characters long for security");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ClockSkew = TimeSpan.Zero // Remove default 5 minute clock skew
    };
});

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PatientOnly", policy => policy.RequireRole("patient"));
    options.AddPolicy("DoctorOnly", policy => policy.RequireRole("doctor", "Doctor"));
    options.AddPolicy("SecretaryOnly", policy => policy.RequireRole("secretary"));
    options.AddPolicy("DoctorOrSecretary", policy => policy.RequireRole("doctor", "secretary"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
});

// Rate Limiting Configuration
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 100
        },
        new RateLimitRule
        {
            Endpoint = "*/api/auth/login",
            Period = "1m",
            Limit = 5
        },
        new RateLimitRule
        {
            Endpoint = "*/api/auth/signup",
            Period = "1m",
            Limit = 3
        },
        new RateLimitRule
        {
            Endpoint = "*/api/auth/check-username",
            Period = "1m",
            Limit = 20
        }
    };
});

builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactFrontend", policy =>
    {
        var allowedOrigins = builder.Environment.IsDevelopment()
            ? new[] { "http://localhost:3000", "http://localhost:5173", "http://localhost:5174" }
            : new[] { "https://yourdomain.com" }; // Update with your production domain

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Ensure database exists
// Database initialization and seeding is handled at the end of the pipeline


// Configure the HTTP request pipeline.
app.Use(async (context, next) =>
{
    Console.WriteLine($"[Request] {context.Request.Method} {context.Request.Path}{context.Request.QueryString}");
    await next();
});

if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi();
}

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    
    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    }
    
    await next();
});

// Enable CORS - must be before UseHttpsRedirection and UseAuthorization
app.UseCors("AllowReactFrontend");

// Enable static files to serve uploaded photos
app.UseStaticFiles();

// Enable HTTPS redirection in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Rate Limiting
app.UseIpRateLimiting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/api/health", () => "OK").AllowAnonymous();

// Seed database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
        
        // For development: delete and recreate database
        try
        {
            context.Database.EnsureDeleted();
            await Task.Delay(500); // Wait for deletion to complete
        }
        catch (Exception delEx)
        {
            Console.WriteLine($"Note: Could not delete existing database: {delEx.Message}");
            Console.WriteLine("Attempting to continue with existing database...");
        }
        
        context.Database.EnsureCreated();

        // Ensure Email column exists (for existing databases)
        try
        {
            var connection = context.Database.GetDbConnection();
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = @"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'Email')
                BEGIN
                    ALTER TABLE [Users] ADD [Email] nvarchar(100) NULL;
                END";
            await command.ExecuteNonQueryAsync();
            await connection.CloseAsync();
            Console.WriteLine("Email column verified/added successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Could not verify Email column: {ex.Message}");
        }

        Console.WriteLine("Database created/verified successfully!");
        
        await DMS_DOTNETREACT.Helpers.DatabaseSeeder.SeedDatabase(context, passwordHasher);
        Console.WriteLine("Database seeded successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"WARNING: Database setup encountered an error: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
        }
        Console.WriteLine("Application will continue to start, but database may need manual intervention.");
        Console.WriteLine("To fix: Delete the DmsDemoDb database manually and restart the application.");
        // Don't throw - allow the app to start even if seeding fails
    }
}

app.Run();
