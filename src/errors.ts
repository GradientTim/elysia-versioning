/**
 * @deprecated
 */
export class UriError extends Error {}

/**
 * @deprecated
 */
export class QueryError extends Error {}

/**
 * @deprecated
 */
export class HeaderError extends Error {}

/**
 * @deprecated
 */
export class CustomError extends Error {}

/**
 * @deprecated
 */
export class UriUnknownVersionError extends UriError {
  constructor(version: string) {
    super(`Unable to find version '${version}'`)
  }
}

/**
 * @deprecated
 */
export class UriUnexpectedError extends CustomError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}

/**
 * @deprecated
 */
export class QueryUnknownVersionError extends UriError {
  constructor(version: string) {
    super(`Unable to find version '${version}'`)
  }
}

/**
 * @deprecated
 */
export class QueryUnexpectedError extends CustomError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}

/**
 * @deprecated
 */
export class HeaderWrongPrefixError extends HeaderError {
  constructor(expected: string, actual: string) {
    super(`'${actual}' does not start with the expected prefix '${expected}'`)
  }
}

/**
 * @deprecated
 */
export class HeaderUnknownVersionError extends HeaderError {
  constructor(version: string) {
    super(`Unable to find version '${version}'`)
  }
}

/**
 * @deprecated
 */
export class HeaderUnexpectedError extends HeaderError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}

/**
 * @deprecated
 */
export class CustomUnexpectedError extends CustomError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}
