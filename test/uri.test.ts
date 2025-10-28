import Elysia from 'elysia'
import { expect, test } from 'bun:test'
import versioning from '../src'

test('route correctly with default options behaviour', async () => {
  const v1 = new Elysia().get('', () => 'Version 1')

  const v2 = new Elysia().get('', () => 'Version 2')

  const app = new Elysia().use(
    versioning({
      prefix: 'v',
      strategy: {
        type: 'URI',
      },
      versions: {
        '1': v1,
        '2': v2,
      },
    }),
  )

  const responseV1 = await app
    .handle(new Request('http://localhost/v1'))
    .then((res) => res.text())

  const responseV2 = await app
    .handle(new Request('http://localhost/v2'))
    .then((res) => res.text())

  expect(responseV1).toBe('Version 1')
  expect(responseV2).toBe('Version 2')
})

test('route correctly with different prefix', async () => {
  const v1 = new Elysia().get('', () => 'Version 1')

  const v2 = new Elysia().get('', () => 'Version 2')

  const app = new Elysia().use(
    versioning({
      prefix: 'myVer',
      strategy: {
        type: 'URI',
      },
      versions: {
        '1': v1,
        '2': v2,
      },
    }),
  )

  const responseV1 = await app
    .handle(new Request('http://localhost/myVer1'))
    .then((res) => res.text())

  const responseV2 = await app
    .handle(new Request('http://localhost/myVer2'))
    .then((res) => res.text())

  expect(responseV1).toBe('Version 1')
  expect(responseV2).toBe('Version 2')
})
