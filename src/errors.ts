export class UriError extends Error {}
export class QueryError extends Error {}
export class HeaderError extends Error {}
export class CustomError extends Error {}

export class UriUnknownVersionError extends UriError {
  constructor(version: string) {
    super(`Unable to find version '${version}'`)
  }
}

export class UriUnexpectedError extends CustomError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}

export class QueryUnknownVersionError extends UriError {
  constructor(version: string) {
    super(`Unable to find version '${version}'`)
  }
}

export class QueryUnexpectedError extends CustomError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}

export class HeaderWrongPrefixError extends HeaderError {
  constructor(expected: string, actual: string) {
    super(`'${actual}' does not start with the expected prefix '${expected}'`)
  }
}

export class HeaderUnknownVersionError extends HeaderError {
  constructor(version: string) {
    super(`Unable to find version '${version}'`)
  }
}

export class HeaderUnexpectedError extends HeaderError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}

export class CustomUnexpectedError extends CustomError {
  constructor(readonly child: Error) {
    super()
    this.child = child
  }
}
