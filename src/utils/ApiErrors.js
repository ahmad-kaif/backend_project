//The ApiError class is a custom error class designed to handle API errors in a consistent way. It extends the built-in Error class and adds additional properties that are useful for handling errors in an API context.


class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode=statusCode
        this.data = null
        this.message=message
        this.success = false;
        this.errors = errors

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export { ApiError } 