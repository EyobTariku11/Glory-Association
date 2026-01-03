using System.Text.Json;

namespace MembershipAPI.Services
{
    public interface ILoggingService
    {
        void LogError(Exception ex, string context = "");
        void LogWarning(string message, string context = "");
        void LogInfo(string message, string context = "");
        void LogRequest(HttpContext context, TimeSpan duration);
        void LogResponse(HttpContext context, int statusCode, TimeSpan duration);
    }

    public class LoggingService : ILoggingService
    {
        private readonly ILogger<LoggingService> _logger;
        private readonly IWebHostEnvironment _env;

        public LoggingService(ILogger<LoggingService> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        public void LogError(Exception ex, string context = "")
        {
            var logData = new
            {
                Timestamp = DateTime.UtcNow,
                Level = "Error",
                Context = context,
                ExceptionType = ex.GetType().Name,
                Message = ex.Message,
                StackTrace = _env.IsDevelopment() ? ex.StackTrace : null,
                InnerException = ex.InnerException?.Message,
                Source = ex.Source
            };

            _logger.LogError(ex, "Error in {Context}: {Message}", context, ex.Message);
            
            // You can also log to file or external service here
            LogToFile("error", logData);
        }

        public void LogWarning(string message, string context = "")
        {
            var logData = new
            {
                Timestamp = DateTime.UtcNow,
                Level = "Warning",
                Context = context,
                Message = message
            };

            _logger.LogWarning("Warning in {Context}: {Message}", context, message);
            LogToFile("warning", logData);
        }

        public void LogInfo(string message, string context = "")
        {
            var logData = new
            {
                Timestamp = DateTime.UtcNow,
                Level = "Info",
                Context = context,
                Message = message
            };

            _logger.LogInformation("Info in {Context}: {Message}", context, message);
            LogToFile("info", logData);
        }

        public void LogRequest(HttpContext context, TimeSpan duration)
        {
            var logData = new
            {
                Timestamp = DateTime.UtcNow,
                Level = "Info",
                Type = "Request",
                Method = context.Request.Method,
                Path = context.Request.Path,
                QueryString = context.Request.QueryString.ToString(),
                UserAgent = context.Request.Headers["User-Agent"].ToString(),
                IPAddress = GetClientIPAddress(context),
                Duration = duration.TotalMilliseconds
            };

            _logger.LogInformation("Request: {Method} {Path} - {Duration}ms", 
                context.Request.Method, context.Request.Path, duration.TotalMilliseconds);
            LogToFile("request", logData);
        }

        public void LogResponse(HttpContext context, int statusCode, TimeSpan duration)
        {
            var logData = new
            {
                Timestamp = DateTime.UtcNow,
                Level = statusCode >= 400 ? "Warning" : "Info",
                Type = "Response",
                Method = context.Request.Method,
                Path = context.Request.Path,
                StatusCode = statusCode,
                Duration = duration.TotalMilliseconds
            };

            if (statusCode >= 400)
            {
                _logger.LogWarning("Response: {Method} {Path} - {StatusCode} - {Duration}ms", 
                    context.Request.Method, context.Request.Path, statusCode, duration.TotalMilliseconds);
            }
            else
            {
                _logger.LogInformation("Response: {Method} {Path} - {StatusCode} - {Duration}ms", 
                    context.Request.Method, context.Request.Path, statusCode, duration.TotalMilliseconds);
            }
            
            LogToFile("response", logData);
        }

        private string GetClientIPAddress(HttpContext context)
        {
            var forwardedHeader = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedHeader))
            {
                return forwardedHeader.Split(',')[0].Trim();
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private void LogToFile(string logType, object logData)
        {
            try
            {
                var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");
                if (!Directory.Exists(logDirectory))
                {
                    Directory.CreateDirectory(logDirectory);
                }

                var fileName = $"{logType}_{DateTime.Now:yyyy-MM-dd}.json";
                var filePath = Path.Combine(logDirectory, fileName);

                var jsonString = JsonSerializer.Serialize(logData, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                File.AppendAllText(filePath, jsonString + Environment.NewLine);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write to log file");
            }
        }
    }
} 