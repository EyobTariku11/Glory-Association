using System.Net;
using System.Text.Json;
using Implementation.Helper;

namespace MembershipAPI.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ResponseMessage<object>
            {
                Success = false,
                Message = GetUserFriendlyMessage(exception),
                ErrorCode = GetErrorCode(exception),
                Data = null
            };

            // Add detailed error information in development
            if (_env.IsDevelopment())
            {
                response.Data = new
                {
                    ExceptionType = exception.GetType().Name,
                    StackTrace = exception.StackTrace,
                    InnerException = exception.InnerException?.Message,
                    RequestPath = context.Request.Path,
                    RequestMethod = context.Request.Method
                };
            }

            context.Response.StatusCode = GetHttpStatusCode(exception);

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }

        private string GetUserFriendlyMessage(Exception exception)
        {
            return exception switch
            {
                ArgumentNullException => "A required parameter is missing.",
                ArgumentException => "Invalid parameter provided.",
                UnauthorizedAccessException => "You are not authorized to perform this action.",
                InvalidOperationException => "The requested operation cannot be performed.",
                NotSupportedException => "This operation is not supported.",
                NotImplementedException => "This feature is not yet implemented.",
                TimeoutException => "The operation timed out. Please try again.",
                HttpRequestException => "A network error occurred. Please check your connection.",
                _ => "An unexpected error occurred. Please try again later."
            };
        }

        private string GetErrorCode(Exception exception)
        {
            return exception switch
            {
                ArgumentNullException => "ERR_NULL_ARGUMENT",
                ArgumentException => "ERR_ARGUMENT",
                UnauthorizedAccessException => "ERR_UNAUTHORIZED",
                InvalidOperationException => "ERR_INVALID_OPERATION",
                NotSupportedException => "ERR_NOT_SUPPORTED",
                NotImplementedException => "ERR_NOT_IMPLEMENTED",
                TimeoutException => "ERR_TIMEOUT",
                HttpRequestException => "ERR_HTTP_REQUEST",
                _ => "ERR_UNKNOWN"
            };
        }

        private int GetHttpStatusCode(Exception exception)
        {
            return exception switch
            {
                ArgumentNullException or ArgumentException => (int)HttpStatusCode.BadRequest,
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                InvalidOperationException => (int)HttpStatusCode.BadRequest,
                NotSupportedException => (int)HttpStatusCode.NotImplemented,
                NotImplementedException => (int)HttpStatusCode.NotImplemented,
                TimeoutException => (int)HttpStatusCode.RequestTimeout,
                HttpRequestException => (int)HttpStatusCode.BadGateway,
                _ => (int)HttpStatusCode.InternalServerError
            };
        }
    }
} 