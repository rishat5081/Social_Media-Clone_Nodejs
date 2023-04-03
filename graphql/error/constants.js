


exports.errorName = {
    NOT_FOUND : 'NOT_FOUND',
    UN_AUTHORIZED : "UN_AUTHORIZED",
    BAD_REQUEST : "BAD_REQUEST",
    CONFLICT : "CONFLICT",
    SERVER_ERROR : "SERVER_ERROR",
    INVALID_CREDENTIALS :  'INVALID_CREDENTIALS'
}




exports.errorType = {
    NOT_FOUND : {
        message : 'Not Found',
        statusCode : 404
    },
    UN_AUTHORIZED : {
        message : 'UnAuthorized User',
        statusCode : 401
    },
    BAD_REQUEST : {
        message : 'Bad Request',
        statusCode : 400
    },
    CONFLICT : {
        message : 'Conflict',
        statusCode : 409
    },
    SERVER_ERROR : {
        message : "Server Error",
        statusCode : 500
    },
    INVALID_CREDENTIALS : {
        message : "Invalid Credentials",
        statusCode : 400
    }
}