import type Elysia from 'elysia'

import type { HeaderStatus, QueryStatus } from './status.ts'

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
      /**
       * When set to true, requests that does not start with one of the versions
       * will go through the default version handler.
       *
       * @example GET / will be treated as GET /v1
       * @defaultValue `true`
       */
      redirectDefault?: boolean
    }
  | {
      type: 'QUERY'
      /**
       * The name of the query where the version should be included
       * @default Uses the value from `options.prefix`
       */
      queryName?: string
      /**
       * When set to true, requests that have not the version query parameter
       * will go through the default version handler.
       *
       * @example GET / will be treated as GET /?v=1
       * @defaultValue `true`
       */
      redirectDefault?: boolean
      /**
       * Will be called when the plugin is not able to handle any registered version handler.
       *
       * @param status
       */
      onStatus?: (status: QueryStatus) => void
    }
  | {
      type: 'HEADER'
      /**
       * The name of the header which should be used to receive the version value from.
       *
       * @default `X-Version`
       */
      headerName?: string
      redirectDefault?: boolean
      /**
       * Will be called when the plugin is not able to handle any registered version handler.
       *
       * @param status
       */
      onStatus?: (status: HeaderStatus) => void
    }
  | {
      type: 'CUSTOM'
      /**
       * The function to return an Elysia instance from a raw request.
       *
       * @param request
       * @param options
       */
      extract: (request: Request, options: BaseVersioningOptions) => Elysia
    }
