using MembershipAPI.Services;

namespace MembershipAPI.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ILoggingService loggingService)
        {
            var startTime = DateTime.UtcNow;
            var originalBodyStream = context.Response.Body;

            try
            {
                // Log the incoming request
                loggingService.LogRequest(context, TimeSpan.Zero);

                // Create a new memory stream for the response
                using var memoryStream = new MemoryStream();
                context.Response.Body = memoryStream;

                // Call the next middleware
                await _next(context);

                // Copy the response back to the original stream
                memoryStream.Position = 0;
                await memoryStream.CopyToAsync(originalBodyStream);

                // Log the response
                var duration = DateTime.UtcNow - startTime;
                loggingService.LogResponse(context, context.Response.StatusCode, duration);
            }
            catch (Exception ex)
            {
                // Log the error
                var duration = DateTime.UtcNow - startTime;
                loggingService.LogError(ex, $"Request: {context.Request.Method} {context.Request.Path}");
                loggingService.LogResponse(context, 500, duration);

                // Restore the original response body stream
                context.Response.Body = originalBodyStream;

                // Re-throw the exception to be handled by the global exception middleware
                throw;
            }
            finally
            {
                // Ensure the original body stream is restored
                context.Response.Body = originalBodyStream;
            }
        }
    }
} 