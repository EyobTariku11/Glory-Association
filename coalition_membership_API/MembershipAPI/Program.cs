using MembershipImplementation.Datas;
using MembershipImplementation.DTOS.Authentication;
using MembershipInfrustructure.Data;
using MembershipInfrustructure.Model.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.IIS;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json.Serialization;
using Hangfire;
using MembershipImplementation.Interfaces.HRM;
using Microsoft.AspNetCore.Mvc.Filters;
using Hangfire.Dashboard;
using HangfireBasicAuthenticationFilter;
using OfficeOpenXml;
using MembershipAPI.Services;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
ExcelPackage.LicenseContext = LicenseContext.Commercial;
builder.Services.AddCors(policyBuilder =>
    policyBuilder.AddDefaultPolicy(policy =>
        policy.WithOrigins("*").AllowAnyHeader().AllowAnyHeader())
);

//builder.Services.AddCors();
builder.Services.AddControllers(options =>
{
    options.Filters.Add<MembershipAPI.Filters.GlobalExceptionFilter>();
}).AddJsonOptions(
    options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, true));
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.Configure<ApplicationSetting>(builder.Configuration.GetSection("ApplicationSetting"));



builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();






builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 4;
});

builder.Services.Configure<FormOptions>(o =>
{
    o.ValueLengthLimit = int.MaxValue;
    o.MultipartBodyLengthLimit = int.MaxValue;
    o.MemoryBufferThreshold = int.MaxValue;
    o.MultipartHeadersLengthLimit = int.MaxValue;
});

// Configure file upload limits
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = int.MaxValue;
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = int.MaxValue;
});


builder.Services.AddSingleton<IConfiguration>(builder.Configuration);


        // Add Hangfire
        builder.Services.AddHangfire((sp, config) =>
{
    var connectionString = sp.GetRequiredService<IConfiguration>().GetConnectionString("SqlConnection");
    config.UseSqlServerStorage(connectionString);
});

builder.Services.AddHangfireServer();

var emailSettings = builder.Configuration.GetSection("EmailSettings");
var defaultFromEmail = emailSettings["DefaultFromEmail"];
var host = emailSettings["SMTPSetting:Host"];
var port = emailSettings.GetValue<int>("SMTPSetting:Port");
var userName = emailSettings["SMTPSetting:UserName"];
var password = emailSettings["SMTPSetting:Password"];
builder.Services.AddFluentEmail(defaultFromEmail)
    .AddSmtpSender(host, port, userName, password);
builder.Services.AddCoreBusiness();
builder.Services.AddAutoMapper(typeof(AutoMapperConfigurations));

//Jwt Authentication

var key = Encoding.UTF8.GetBytes(builder.Configuration["ApplicationSetting:JWT_Secret"].ToString());

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = false;
    x.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});



builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ILoggingService, LoggingService>();
builder.Services.AddSwaggerGen();
builder.Services.Configure<FormOptions>(options =>
    {
        options.MultipartBodyLengthLimit = 104857600; // 100 MB, adjust as needed
    });

var app = builder.Build();

// Add global exception handling middleware
app.UseMiddleware<MembershipAPI.Middleware.GlobalExceptionMiddleware>();

// Add request logging middleware
app.UseMiddleware<MembershipAPI.Middleware.RequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}




// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{

    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[]
         {
        new HangfireCustomBasicAuthenticationFilter
        {
            User="admin",
            Pass="admin",

        }
    }
    });

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Membership Digital Platforms");
        c.InjectStylesheet("/swagger-ui/SwaggerDark.css");
    });

}
app.UseHttpsRedirection();

app.UseCors(cors =>
           cors.WithOrigins("*")
           .AllowAnyHeader()
           .AllowAnyMethod()
           );
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), @"wwwroot")),
    RequestPath = new PathString("/wwwroot")
});



RecurringJob.AddOrUpdate<IMemberService>(a => a.UPdateExpiredDateStatus(), Cron.Daily(0));
RecurringJob.AddOrUpdate<IMemberService>(a => a.UpdateBirthDate(), Cron.Daily(0));


/* var filePath = Path.Combine(Directory.GetCurrentDirectory(), @"wwwroot/abizeermembership-firebase-adminsdk-5nqnz-70aad41749.json");

FirebaseApp.Create(new AppOptions()
{
    Credential = GoogleCredential.FromFile(filePath)
}); */


app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
