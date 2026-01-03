namespace MembershipImplementation.DTOS.Configuration;

public record NotificationRequestDto
{
    public string Title { get; set; }
    public string Body { get; set; }
}

public class ResponseMessageNot<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }

    public static ResponseMessageNot<T> SuccessResponse(T data, string message = "Operation successful.")
    {
        return new ResponseMessageNot<T> { Success = true, Message = message, Data = data };
    }

    public static ResponseMessageNot<T> FailureResponse(string message)
    {
        return new ResponseMessageNot<T> { Success = false, Message = message, Data = default(T) };
    }
}
