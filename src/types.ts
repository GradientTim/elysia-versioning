import type Elysia from 'elysia'

import type {
  CustomError,
  HeaderError,
  QueryError,
  UriError,
} from './errors.ts'

export type BaseVersioningOptions = VersioningOptions<Record<string, Elysia>>

export interface VersioningOptions<TVersions extends Record<string, Elysia>> {
  /**
   *
   * The prefix used for version identifiers in requests.
   * For example, with a prefix of 'v', version 1 routes would look like `/v1/...`.
   *
   * @defaultValue v
   */
  prefix: string

  /**
   * The strategy used to determine how versions are applied to routes.
   * Typically, defines whether versioning is handled via URI, headers, or other mechanisms.
   *
   * @defaultValue { type: 'URI' }
   */
  strategy: VersioningStrategy

  /**
   * A mapping of version identifiers to their corresponding Elysia application instances.
   * Each key represents a version (e.g., `'1'`, `'2'`), and its value is the Elysia app handling that version.
   */
  versions: TVersions

  /**
   * The default version of the API to use when no version is specified in a request.
   *
   * @defaultValue 1
   */
  defaultVersion: keyof TVersions
}

export type VersioningStrategy =
  | {
      type: 'URI'
      redirectDefault?: boolean
      onError?: (error: UriError) => void
    }
  | {
      type: 'QUERY'
      queryName?: string
      redirectDefault?: boolean
      onError?: (error: QueryError) => void
    }
  | {
      type: 'HEADER'
      headerName?: string
      onError?: (error: HeaderError) => void
    }
  | {
      type: 'CUSTOM'
      extract: (request: Request, options: BaseVersioningOptions) => Elysia
      onError?: (error: CustomError) => void
    }
