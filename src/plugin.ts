import Elysia from 'elysia'
import { mergeDeep } from 'elysia/utils'

import {
  CustomUnexpectedError,
  HeaderUnexpectedError,
  HeaderUnknownVersionError,
  HeaderWrongPrefixError,
  QueryUnexpectedError,
  QueryUnknownVersionError,
  UriUnexpectedError,
  UriUnknownVersionError,
} from './errors.ts'

import type { BaseVersioningOptions, VersioningOptions } from './types.ts'

export const defaultOptions: BaseVersioningOptions = {
  prefix: 'v',
  versions: {},
  strategy: {
    type: 'URI',
  },
  defaultVersion: '1',
}

function versioning<TVersions extends Record<string, Elysia>>(
  options: Partial<VersioningOptions<TVersions>> = {},
): Elysia {
  const _options: VersioningOptions<TVersions> = mergeDeep(
    defaultOptions,
    options,
  )

  const plugin = new Elysia({
    name: 'versioning',
    seed: _options,
  })

  const versions = Object.entries(_options.versions)
  const versionKeys = versions.map(([key]) => key)

  const prefix = _options.prefix.trim()
  let defaultVersion = _options.defaultVersion.toString().trim()

  if (!versionKeys.includes(defaultVersion)) {
    const [firstVersion] = versionKeys
    if (firstVersion) {
      defaultVersion = firstVersion
    }
  }

  const versionRegex = new RegExp(
    `(${versions.map(([version]) => `${prefix}${version}`).join('|')})`,
  )

  switch (_options.strategy.type) {
    case 'URI': {
      const errorFunction = _options.strategy.onError
      const redirectDefault = _options.strategy.redirectDefault ?? true

      for (const [version, handler] of versions) {
        plugin.group(`${prefix}${version}`, (app) => app.use(handler))
      }

      if (redirectDefault) {
        plugin.onRequest(async ({ request }) => {
          const url = new URL(request.url)
          const path = url.pathname

          const pathParts = path
            .split('/')
            .filter((element: string) => element.trim().length > 0)

          const firstPath = pathParts[0] ?? path

          /*
           * When the first path is '/' or not matches one of the configured versions,
           * fallback to the default version handler.
           *
           * Example 1: (defaultVersion: '1')
           * GET /users/1 will be treated as /v1/users/1
           * GET / will be treated as /v1/
           *
           * Example 2: (defaultVersion: '2')
           * GET /users/1 will be treated as /v2/users/1
           * GET / will be treated as /v2/
           */
          if (firstPath === '/' || firstPath.match(versionRegex) === null) {
            const handler = _options.versions[defaultVersion]
            if (!handler) {
              errorFunction?.(new UriUnknownVersionError(defaultVersion))
              return
            }

            try {
              return await handler.handle(request)
            } catch (error: unknown) {
              errorFunction?.(new UriUnexpectedError(error as Error))
            }
          }
        })
      }
      break
    }

    case 'QUERY': {
      const queryName = _options.strategy.queryName ?? prefix
      const redirectDefault = _options.strategy.redirectDefault ?? true
      const errorFunction = _options.strategy.onError

      plugin.onRequest(async ({ request }) => {
        const url = new URL(request.url)
        const searchParameters = url.searchParams

        const versionQueryParameter = searchParameters.get(queryName)
        if (versionQueryParameter) {
          const handler = _options.versions[versionQueryParameter]
          if (!handler) {
            errorFunction?.(new QueryUnknownVersionError(versionQueryParameter))
            return
          }

          try {
            return await handler.handle(request)
          } catch (error: unknown) {
            errorFunction?.(new QueryUnexpectedError(error as Error))
          }
        }

        if (redirectDefault) {
          const defaultHandler = _options.versions[defaultVersion]
          if (!defaultHandler) {
            errorFunction?.(new QueryUnknownVersionError(defaultVersion))
            return
          }

          try {
            return await defaultHandler.handle(request)
          } catch (error: unknown) {
            errorFunction?.(new QueryUnexpectedError(error as Error))
          }
        }
      })
      break
    }

    case 'HEADER': {
      const headerName = _options.strategy.headerName ?? 'X-Version'
      const errorFunction = _options.strategy.onError

      plugin.onRequest(async ({ request }) => {
        const header = request.headers.get(headerName)
        let version: string = defaultVersion

        if (header) {
          if (!header.startsWith(prefix)) {
            errorFunction?.(new HeaderWrongPrefixError(prefix, header))
            return
          }
          version = header.replace(prefix, '')
        }

        const handler = _options.versions[version]
        if (!handler) {
          errorFunction?.(new HeaderUnknownVersionError(version))
          return
        }

        try {
          return await handler.handle(request)
        } catch (error: unknown) {
          errorFunction?.(new HeaderUnexpectedError(error as Error))
        }
      })
      break
    }

    case 'CUSTOM': {
      const extractFunction = _options.strategy.extract
      const errorFunction = _options.strategy.onError

      plugin.onRequest(async ({ request }) => {
        try {
          return await extractFunction(
            request,
            _options as unknown as BaseVersioningOptions,
          ).handle(request)
        } catch (error: unknown) {
          errorFunction?.(new CustomUnexpectedError(error as Error))
        }
      })
      break
    }
  }

  return plugin
}

export default versioning
