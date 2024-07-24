class BaseError extends Error {

  statusCode: number;
  isOperational: boolean;

  constructor(name: string, statusCode: number, message: string,) {
    super(message,);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = true; // To differentiate between operational errors and programming errors
  }
}

class NotFoundError extends BaseError {
  constructor(message: string,) {
    super('NotFoundError', 404, message,);
  }
}

class ValidationError extends BaseError {
  constructor(message: string,) {
    super('ValidationError', 400, message,);
  }
}
class InvalidOperationError extends BaseError {
  constructor(message: string,) {
    super('InvalidOperationError', 409, message,);
  }
}
class BadRequestError extends BaseError {
  constructor(message: string,) {
    super('BadRequestError', 400, message,);
  }
}
class UnauthorizedError extends BaseError {
  constructor(message: string,) {
    super('UnauthorizedError', 401, message,);
  }
}
class ForbiddenError extends BaseError {
  constructor(message: string,) {
    super('ForbiddenError', 403, message,);
  }
}

module.exports = {
  NotFoundError,
  ValidationError,
  InvalidOperationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
};
