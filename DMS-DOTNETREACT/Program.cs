using DMS_DOTNETREACT.Data;
using DMS_DOTNETREACT.Services;
using DMS_DOTNETREACT.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AspNetCoreRateLimit;
using DMS_DOTNETREACT.Hubs;

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

// SignalR
builder.Services.AddSignalR();

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

    // Allow JWT tokens over WebSockets for SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"].ToString();
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
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
        if (builder.Environment.IsDevelopment())
        {
            // In development, allow the Vite dev server from localhost OR LAN IPs.
            // This avoids CORS issues when accessing the frontend via the Network URL (e.g. http://192.168.x.x:5174).
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            var allowedOrigins = new[] { "https://yourdomain.com" }; // Update with your production domain

            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
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
app.MapHub<ChatHub>("/hubs/chat");
app.MapGet("/api/health", () => "OK").AllowAnonymous();

// Seed database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();

        context.Database.Migrate();

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
                END

                IF OBJECT_ID(N'[dbo].[ChatConversations]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[ChatConversations](
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [PatientId] int NOT NULL,
                        [AssignedSecretaryId] int NULL,
                        [Status] nvarchar(20) NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [ClosedAt] datetime2 NULL,
                        CONSTRAINT [PK_ChatConversations] PRIMARY KEY CLUSTERED ([Id] ASC)
                    );

                    ALTER TABLE [dbo].[ChatConversations] WITH CHECK ADD CONSTRAINT [FK_ChatConversations_Patients_PatientId]
                        FOREIGN KEY([PatientId]) REFERENCES [dbo].[Patients] ([Id]);
                    ALTER TABLE [dbo].[ChatConversations] CHECK CONSTRAINT [FK_ChatConversations_Patients_PatientId];

                    ALTER TABLE [dbo].[ChatConversations] WITH CHECK ADD CONSTRAINT [FK_ChatConversations_Secretaries_AssignedSecretaryId]
                        FOREIGN KEY([AssignedSecretaryId]) REFERENCES [dbo].[Secretaries] ([Id]);
                    ALTER TABLE [dbo].[ChatConversations] CHECK CONSTRAINT [FK_ChatConversations_Secretaries_AssignedSecretaryId];

                    CREATE INDEX [IX_ChatConversations_PatientId] ON [dbo].[ChatConversations]([PatientId]);
                    CREATE INDEX [IX_ChatConversations_AssignedSecretaryId] ON [dbo].[ChatConversations]([AssignedSecretaryId]);
                END

                IF OBJECT_ID(N'[dbo].[ChatMessages]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[ChatMessages](
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [ConversationId] int NOT NULL,
                        [SenderUserId] int NOT NULL,
                        [SenderRole] nvarchar(20) NOT NULL,
                        [Text] nvarchar(2000) NOT NULL,
                        [SentAt] datetime2 NOT NULL,
                        [ReadAt] datetime2 NULL,
                        CONSTRAINT [PK_ChatMessages] PRIMARY KEY CLUSTERED ([Id] ASC)
                    );

                    ALTER TABLE [dbo].[ChatMessages] WITH CHECK ADD CONSTRAINT [FK_ChatMessages_ChatConversations_ConversationId]
                        FOREIGN KEY([ConversationId]) REFERENCES [dbo].[ChatConversations] ([Id]) ON DELETE CASCADE;
                    ALTER TABLE [dbo].[ChatMessages] CHECK CONSTRAINT [FK_ChatMessages_ChatConversations_ConversationId];

                    CREATE INDEX [IX_ChatMessages_ConversationId] ON [dbo].[ChatMessages]([ConversationId]);
                END

                IF OBJECT_ID(N'[dbo].[SecretaryAvailabilities]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[SecretaryAvailabilities](
                        [SecretaryId] int NOT NULL,
                        [IsAvailable] bit NOT NULL,
                        [UpdatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_SecretaryAvailabilities] PRIMARY KEY CLUSTERED ([SecretaryId] ASC)
                    );

                    ALTER TABLE [dbo].[SecretaryAvailabilities] WITH CHECK ADD CONSTRAINT [FK_SecretaryAvailabilities_Secretaries_SecretaryId]
                        FOREIGN KEY([SecretaryId]) REFERENCES [dbo].[Secretaries] ([Id]) ON DELETE CASCADE;
                    ALTER TABLE [dbo].[SecretaryAvailabilities] CHECK CONSTRAINT [FK_SecretaryAvailabilities_Secretaries_SecretaryId];
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
