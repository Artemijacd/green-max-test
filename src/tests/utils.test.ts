import { describe, expect, it } from 'vitest'
import { formatPhone, getCredentialsError, getPhoneError, phoneDigits } from '@/utils'

const VALID_TOKEN = 'd75b3a66374942c5b3c019c698abc2067e151558acbd451234'

describe('phoneDigits', () => {
  it('keeps only digits', () => {
    expect(phoneDigits('+7 (999) 123-45-67')).toBe('79991234567')
  })
})

describe('formatPhone', () => {
  it.each([
    ['9', '+7 (9'],
    ['9991', '+7 (999) 1'],
    ['9991234', '+7 (999) 123-4'],
    ['999123456', '+7 (999) 123-45-6'],
    ['9991234567', '+7 (999) 123-45-67'],
  ])('formats partial input %s as %s', (input, expected) => {
    expect(formatPhone(input)).toBe(expected)
  })

  it.each(['89991234567', '79991234567', '+7 999 123-45-67', '+7 (999) 123-45-67'])('normalizes pasted %s', (input) => {
    expect(formatPhone(input)).toBe('+7 (999) 123-45-67')
  })

  it('cuts digits beyond the national length', () => {
    expect(formatPhone('+7 (999) 123-45-678')).toBe('+7 (999) 123-45-67')
  })

  it('shows the country prefix when a leading 7 or 8 is typed', () => {
    expect(formatPhone('7')).toBe('+7 (')
    expect(formatPhone('8')).toBe('+7 (')
  })

  it('clears the field when the last digit is deleted', () => {
    expect(formatPhone('+7 (', true)).toBe('')
  })

  it('keeps 7 and 8 inside the number', () => {
    expect(formatPhone('+7 (98')).toBe('+7 (98')
  })

  it('returns empty string for input without digits', () => {
    expect(formatPhone('abc')).toBe('')
  })
})

describe('getPhoneError', () => {
  it('accepts a complete mobile number', () => {
    expect(getPhoneError('+7 (999) 123-45-67')).toBeNull()
  })

  it('rejects numbers not starting with 9', () => {
    expect(getPhoneError('+7 (495) 123-45-67')).toBe('sidebar.invalidPhonePrefix')
  })

  it('rejects incomplete numbers', () => {
    expect(getPhoneError('+7 (999) 12')).toBe('sidebar.invalidPhone')
  })
})

describe('getCredentialsError', () => {
  it('accepts valid credentials', () => {
    expect(getCredentialsError({ idInstance: '1101000001', apiTokenInstance: VALID_TOKEN })).toBeNull()
  })

  it.each(['123', '1234567890123', '11010000a1'])('rejects idInstance %s', (idInstance) => {
    expect(getCredentialsError({ idInstance, apiTokenInstance: VALID_TOKEN })).toBe('login.invalidIdInstance')
  })

  it.each(['abc', VALID_TOKEN.slice(1), `${VALID_TOKEN.slice(1)}z`])('rejects token %s', (apiTokenInstance) => {
    expect(getCredentialsError({ idInstance: '1101000001', apiTokenInstance })).toBe('login.invalidApiToken')
  })
})
