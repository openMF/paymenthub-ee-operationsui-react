import { describe, it, expect } from 'vitest'
import { decodeJwtPayload } from './keycloak'

function base64UrlEncode(json: object) {
  const base64 = btoa(JSON.stringify(json))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('decodeJwtPayload', () => {
  it('correctly decodes a valid Base64URL JWT payload', () => {
    const payload = { sub: 'user-123', exp: 1999999999, role: 'admin' }
    const encodedPayload = base64UrlEncode(payload)
    const token = `header.${encodedPayload}.signature`

    expect(decodeJwtPayload(token)).toEqual(payload)
  })

  it('decodes a payload containing Base64URL-only characters (- and _)', () => {
    // Choose a payload whose base64 encoding is likely to include +/ replaced by -_
    const payload = { data: '???>>><<<' }
    const encodedPayload = base64UrlEncode(payload)
    const token = `header.${encodedPayload}.signature`

    expect(decodeJwtPayload(token)).toEqual(payload)
  })

  it('throws on an invalid token with no payload segment', () => {
    expect(() => decodeJwtPayload('not-a-jwt')).toThrow()
  })

  it('throws on a token whose payload segment is not valid base64/JSON', () => {
    const token = 'header.%%%not-base64%%%.signature'
    expect(() => decodeJwtPayload(token)).toThrow()
  })
})
