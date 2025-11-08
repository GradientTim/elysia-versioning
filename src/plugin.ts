import Elysia from 'elysia'
import { mergeDeep } from 'elysia/utils'

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

  const versions = _options.versions
  const versionKeys = Object.keys(versions)

  const prefix = _options.prefix.trim()
  let defaultVersion = _options.defaultVersion.toString().trim()

  if (!versionKeys.includes(defaultVersion)) {
    const [firstVersion] = versionKeys
    if (firstVersion) {
      defaultVersion = firstVersion
    }
  }

  const defaultHandler = versions[defaultVersion]
  if (!defaultHandler) {
    throw new Error(
      `Unable to find handler for default version '${defaultVersion}'`,
    )
  }

  const versionRegex = new RegExp(
    `(${versionKeys.map(([version]) => `${prefix}${version}`).join('|')})`,
  )

  switch (_options.strategy.type) {
    case 'URI': {
      const redirectDefault = _options.strategy.redirectDefault ?? true

      for (const [version, handler] of Object.entries(versions)) {
        plugin.group(`${prefix}${version}`, (app) => app.use(handler))
      }

      if (redirectDefault) {
        plugin.onRequest(async ({ request }) => {
          const url = new URL(request.url)
          const path = url.pathname

          let firstPath: string
          const firstSlashIndex = path.indexOf('/', 1)

          if (firstSlashIndex === -1) {
            firstPath = path.substring(1)
          } else {
            firstPath = path.substring(1, firstSlashIndex)
          }

          if (firstPath.length === 0) {
            firstPath = '/'
          }

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
            return await defaultHandler.handle(request)
          }
        })
      }
      break
    }

    case 'QUERY': {
      const queryName = _options.strategy.queryName ?? prefix
      const redirectDefault = _options.strategy.redirectDefault ?? true
      const statusFunction = _options.strategy.onStatus

      plugin.onRequest(async ({ request }) => {
        const url = new URL(request.url)
        const searchParameters = url.searchParams

        const versionQueryParameter = searchParameters.get(queryName)
        if (versionQueryParameter) {
          const handler = versions[versionQueryParameter]
          if (!handler) {
            statusFunction?.('unknown_version')
            return
          }

          return await handler.handle(request)
        }

        if (redirectDefault) {
          return await defaultHandler.handle(request)
        }
      })
      break
    }

    case 'HEADER': {
      const headerName = _options.strategy.headerName ?? 'X-Version'
      const redirectDefault = _options.strategy.redirectDefault ?? true
      const statusFunction = _options.strategy.onStatus

      plugin.onRequest(async ({ request }) => {
        const header = request.headers.get(headerName)

        if (header) {
          let version: string = header
          if (!version.startsWith(prefix)) {
            statusFunction?.('wrong_prefix')
            return
          }

          const untilIndex = version.indexOf(prefix) + prefix.length
          version = version.substring(untilIndex)

          const handler = versions[version]
          if (!handler) {
            statusFunction?.('unknown_version')
            return
          }

          return await handler.handle(request)
        }

        if (redirectDefault) {
          return defaultHandler.handle(request)
        }
      })
      break
    }

    case 'CUSTOM': {
      const extractFunction = _options.strategy.extract

      plugin.onRequest(async ({ request }) => {
        return await extractFunction(
          request,
          _options as unknown as BaseVersioningOptions,
        ).handle(request)
      })
      break
    }
  }

  return plugin
}

export default versioning
