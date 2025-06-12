export class BaseException extends Error {
  public statusCode: number;
  public message: string;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number = 500, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string = 'Bad request', errors?: Record<string, string[]>) {
    super(message, 400, errors);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ValidationException extends BaseException {
  
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 422, errors);
  }
}