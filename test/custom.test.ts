import Elysia from 'elysia'
import { expect, test } from 'bun:test'
import versioning, { type BaseVersioningOptions } from '../src'

test('always route to the first handler', async () => {
  const v1 = new Elysia().get('', () => 'Version 1')

  const v2 = new Elysia().get('', () => 'Version 2')

  const app = new Elysia().use(
    versioning({
      strategy: {
        type: 'CUSTOM',
        extract: (_request: Request, options: BaseVersioningOptions) => {
          // biome-ignore lint/style/noNonNullAssertion: it is just for the tests
          // biome-ignore lint/suspicious/noExtraNonNullAssertion: it is just for the tests
          return options.versions['1']!!
        },
      },
      versions: {
        '1': v1,
        '2': v2,
      },
    }),
  )

  const responseV1 = await app
    .handle(new Request('http://localhost/'))
    .then((res) => res.text())

  const responseV2 = await app
    .handle(new Request('http://localhost/'))
    .then((res) => res.text())

  expect(responseV1).toBe('Version 1')
  expect(responseV2).toBe('Version 1')
})

test('route with optional referer header', async () => {
  const v1 = new Elysia().get('', () => 'Version 1')

  const v2 = new Elysia().get('', () => 'Version 2')

  const app = new Elysia().use(
    versioning({
      strategy: {
        type: 'CUSTOM',
        extract: (request: Request, options: BaseVersioningOptions) => {
          const refererHeader = request.headers.get('Referer')
          if (refererHeader && refererHeader === 'http://v1.example.com') {
            // biome-ignore lint/style/noNonNullAssertion: it is just for the tests
            // biome-ignore lint/suspicious/noExtraNonNullAssertion: it is just for the tests
            return options.versions['1']!!
          }
          // biome-ignore lint/style/noNonNullAssertion: it is just for the tests
          // biome-ignore lint/suspicious/noExtraNonNullAssertion: it is just for the tests
          return options.versions['2']!!
        },
      },
      versions: {
        '1': v1,
        '2': v2,
      },
    }),
  )

  const responseV1 = await app
    .handle(
      new Request('http://localhost/', {
        headers: {
          Referer: 'http://v1.example.com',
        },
      }),
    )
    .then((res) => res.text())

  const responseV2 = await app
    .handle(new Request('http://localhost/'))
    .then((res) => res.text())

  expect(responseV1).toBe('Version 1')
  expect(responseV2).toBe('Version 2')
})
