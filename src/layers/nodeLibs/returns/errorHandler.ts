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

  //--- Auth Errors
  MissingTokenError = 'There is no token sent',
  UnauthorizedActionError = 'You are not authorized to do this action',
  UnauthorizedStationActionError = 'You are not authorized to do this action for this station',

  //--- for Dealers
  DealerNotFound = 'Dealer not found',
  DealerAlreadyExists = 'Dealer Already Exists',

  //--- for Prices
  PriceNotFound = 'Price entry is not found',
  EffectivityDateOneHourDifference = 'Effectivity date must be at least 1 hour from current date and time',
  MoreThanOneFuturePrice = 'Only one(1) future-dated price update is allowed. Please delete the existing one if you wish to update the prices.',

  //--- for Vouchers
  VoucherDoesNotExist = 'Voucher does not exist',
  VoucherAlreadyRedeemed = 'Voucher is already redeemed',
  VoucherAlreadyExpired = 'Voucher is already expired',
  LockIsStillOpen = 'Price Lock status is still open. It cannot be deleted',

  //--- for Stations
  UserAlreadyHaveALock = 'User already has a lock for this station',
  StationDoesNotExist = 'Station does not exist',
  StationHasNoCurrentPrices = 'Station has no current prices',

  //-- for Points
  PointTypeError = 'Point type is not valid',
  UserNotFound = 'User not found',
}

module.exports = {
  GenericError,
  ERROR_MESSAGES,
  errorHandler,
};
