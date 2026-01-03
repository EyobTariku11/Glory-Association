using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;
using System.Text.Json;
using Implementation.Helper;

namespace MembershipAPI.Filters
{
    public class GlobalExceptionFilter : IExceptionFilter
    {
        private readonly ILogger<GlobalExceptionFilter> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        public void OnException(ExceptionContext context)
        {
            _logger.LogError(context.Exception, "An unhandled exception occurred");

            var response = new ResponseMessage<object>
            {
                Success = false,
                Message = GetUserFriendlyMessage(context.Exception),
                ErrorCode = GetErrorCode(context.Exception),
                Data = null
            };

            // Add detailed error information in development
            if (_env.IsDevelopment())
            {
                response.Data = new
                {
                    ExceptionType = context.Exception.GetType().Name,
                    StackTrace = context.Exception.StackTrace,
                    InnerException = context.Exception.InnerException?.Message
                };
            }

            var result = new ObjectResult(response)
            {
                StatusCode = GetHttpStatusCode(context.Exception)
            };

            context.Result = result;
            context.ExceptionHandled = true;
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