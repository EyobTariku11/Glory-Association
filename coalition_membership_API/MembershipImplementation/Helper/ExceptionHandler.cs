using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security;
using MembershipImplementation.Helper;
using Implementation.Helper;

public static class ExceptionHandler
{
    private static readonly Dictionary<Type, string> ExceptionErrorCodes = new()
    {
        { typeof(ArgumentNullException), "ERR_NULL_ARGUMENT" },
        { typeof(ArgumentOutOfRangeException), "ERR_OUT_OF_RANGE" },
        { typeof(ArgumentException), "ERR_ARGUMENT" },
        { typeof(FileNotFoundException), "ERR_FILE_NOT_FOUND" },
        { typeof(DirectoryNotFoundException), "ERR_DIRECTORY_NOT_FOUND" },
        { typeof(IOException), "ERR_IO" },
        { typeof(InvalidOperationException), "ERR_INVALID_OPERATION" },
        { typeof(NotSupportedException), "ERR_NOT_SUPPORTED" },
        { typeof(NotImplementedException), "ERR_NOT_IMPLEMENTED" },
        { typeof(TaskCanceledException), "ERR_TASK_CANCELED" },
        { typeof(TimeoutException), "ERR_TIMEOUT" },
        { typeof(SqlException), "ERR_SQL" },
        { typeof(DbUpdateException), "ERR_DB_UPDATE" },
        { typeof(UnauthorizedAccessException), "ERR_UNAUTHORIZED" },
        { typeof(SecurityException), "ERR_SECURITY" },
        { typeof(HttpRequestException), "ERR_HTTP_REQUEST" },
        { typeof(Exception), "ERR_UNKNOWN" }  // Catch-all for general exceptions
    };

    public static ResponseMessage<T> HandleException<T>(Exception ex)
    {
        string errorCode = GetErrorCode(ex);
        string message = GetErrorMessage(ex, errorCode);


        return new ResponseMessage<T>
        {
            Success = false,
            Message = message,
            ErrorCode = errorCode,
            Data = default
        };
    }

    private static string GetErrorCode(Exception ex)
    {
        // Check if the exception type is in the dictionary
        if (ExceptionErrorCodes.TryGetValue(ex.GetType(), out var errorCode))
        {
            return errorCode;
        }

        // Return a default error code if the exception type is not mapped
        return "ERR_UNKNOWN";
    }

    private static string GetErrorMessage(Exception ex, string errorCode)
    {
        // Fetch the base message from the exception
        string baseMessage = ex.Message;

        // Optionally add more details from inner exceptions
        if (ex.InnerException != null)
        {
            baseMessage += $" | Inner Exception: {ex.InnerException.Message}";
        }

        // Enhance with specific error codes and additional context
        return errorCode switch
        {
            "ERR_NULL_ARGUMENT" => $"A required argument was null. Details: {baseMessage}",
            "ERR_OUT_OF_RANGE" => $"An argument was out of range. Details: {baseMessage}",
            "ERR_ARGUMENT" => $"An argument error occurred. Details: {baseMessage}",
            "ERR_FILE_NOT_FOUND" => $"The specified file was not found. Details: {baseMessage}",
            "ERR_DIRECTORY_NOT_FOUND" => $"The specified directory was not found. Details: {baseMessage}",
            "ERR_IO" => $"An IO error occurred. Details: {baseMessage}",
            "ERR_INVALID_OPERATION" => $"An invalid operation was attempted. Details: {baseMessage}",
            "ERR_NOT_SUPPORTED" => $"The operation is not supported. Details: {baseMessage}",
            "ERR_NOT_IMPLEMENTED" => $"The operation is not implemented. Details: {baseMessage}",
            "ERR_TASK_CANCELED" => $"The task was canceled. Details: {baseMessage}",
            "ERR_TIMEOUT" => $"The operation timed out. Details: {baseMessage}",
            "ERR_SQL" => $"A SQL error occurred. Details: {baseMessage}",
            "ERR_DB_UPDATE" => $"A database update error occurred. Details: {baseMessage}",
            "ERR_UNAUTHORIZED" => $"Access is unauthorized. Details: {baseMessage}",
            "ERR_SECURITY" => $"A security error occurred. Details: {baseMessage}",
            "ERR_HTTP_REQUEST" => $"An HTTP request error occurred. Details: {baseMessage}",
            _ => $"An unexpected error occurred. Details: {baseMessage}"
        };
    }

}
