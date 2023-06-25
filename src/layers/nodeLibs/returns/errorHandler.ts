export {};

export interface IResponse {
  body: string;
  statusCode: number;
  headers: {
    [header: string]: any;
  };
  isBase64Encoded: boolean;
}

export type Overrides = Partial<Omit<IResponse, 'body'>>;

const JSONHeader = {
  'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
  'Content-Type': 'application/json',
};

/**
 * Parent class that extends the Error type to create custom errors.
 */
class CustomError extends Error {
  private success: boolean;
  private errorCode: string;
  protected meta?: any;

  constructor(message: string | ERROR_MESSAGES) {
    super(message);
    this.success = false;
    this.errorCode =
      this.constructor.name == 'GenericError'
        ? this.getKeyFromEnum(message)
        : this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }

  private getKeyFromEnum = (
    value: ERROR_MESSAGES | string,
  ): keyof typeof ERROR_MESSAGES => {
    const keys = Object.keys(ERROR_MESSAGES) as Array<
      keyof typeof ERROR_MESSAGES
    >;
    for (const key of keys) {
      if (ERROR_MESSAGES[key] === value) {
        return key;
      }
    }
    return keys[0];
  };
}

class GenericError extends CustomError {
  constructor(
    message: ERROR_MESSAGES = ERROR_MESSAGES.UnknownError,
    errorData?: any,
  ) {
    super(message);

    if (errorData) {
      if (errorData.body) {
        let parsedData = JSON.parse(errorData.body).data;
        this.meta = Object.assign(this.meta, parsedData);
      } else {
        this.meta = errorData;
      }
    }
  }
}

/**
 * Error handler or bundler that converts custom errors to lambda HTTP responses
 * @param body The error body that will be used in the HTTP body
 * @param overrides Possible overrides to the default response properties excluding the HTTP body
 */
const errorHandler = (body: any, overrides?: Overrides): IResponse => {
  console.error(body);

  if (!body?.errorCode) {
    body = new GenericError(body ?? null);
  }

  // Create new object to access `message` property from parent `Error` class
  const newBody: any = {
    success: body.success,
    errorCode: body.errorCode,
    message: body.message,
  };
  if (body.meta && Object.keys(body.meta).length > 0) {
    newBody.meta = body.meta;
  }

  return <IResponse>{
    body: JSON.stringify(newBody),
    statusCode: overrides?.statusCode ?? 400,
    headers: overrides?.headers
      ? Object.assign(JSONHeader, overrides.headers)
      : JSONHeader,
    isBase64Encoded: overrides?.isBase64Encoded ?? false,
  };
};

enum ERROR_MESSAGES {
  //--- Unknown Error
  UnknownError = 'An unknown error has occurred',

  //--- Item Errors
  TodoNotFound = 'Todo not found',
  TodoIdMissing = 'Todo ID is missing',
  TodoTitleMissing = 'Todo title is missing',
}

module.exports = {
  GenericError,
  ERROR_MESSAGES,
  errorHandler,
};
