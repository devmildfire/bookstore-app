import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import {
  formatOutSum,
  initSignature,
  recurringSignature,
  resultSignature,
  successSignature,
  signaturesMatch,
} from './signature'

const md5 = (s: string) => createHash('md5').update(s, 'utf8').digest('hex')

describe('formatOutSum', () => {
  it('renders a plain two-decimal amount', () => {
    expect(formatOutSum(1000)).toBe('1000.00')
    expect(formatOutSum(1234.5)).toBe('1234.50')
    expect(formatOutSum(0)).toBe('0.00')
  })
})

describe('initSignature', () => {
  it('hashes MerchantLogin:OutSum:InvId:Password1', () => {
    expect(initSignature({ merchantLogin: 'shop', outSum: '100.00', invId: 7, password1: 'pw1', algo: 'md5' })).toBe(
      md5('shop:100.00:7:pw1'),
    )
  })

  it('inserts the Receipt between InvId and Password1 when present', () => {
    expect(
      initSignature({ merchantLogin: 'shop', outSum: '100.00', invId: 7, password1: 'pw1', algo: 'md5', receipt: 'RCPT' }),
    ).toBe(md5('shop:100.00:7:RCPT:pw1'))
  })

  it('appends Shp_ params sorted, ignoring non-Shp keys', () => {
    expect(
      initSignature({
        merchantLogin: 'shop',
        outSum: '100.00',
        invId: 7,
        password1: 'pw1',
        algo: 'md5',
        shp: { Shp_b: 2, Shp_a: 1, other: 9 },
      }),
    ).toBe(md5('shop:100.00:7:pw1:Shp_a=1:Shp_b=2'))
  })

  it('recurringSignature is the same formula as initSignature', () => {
    expect(recurringSignature).toBe(initSignature)
  })
})

describe('result / success signatures', () => {
  it('result hashes OutSum:InvId:Password2', () => {
    expect(resultSignature({ outSum: '100.00', invId: 7, password2: 'pw2', algo: 'md5' })).toBe(md5('100.00:7:pw2'))
  })

  it('success hashes OutSum:InvId:Password1', () => {
    expect(successSignature({ outSum: '100.00', invId: 7, password1: 'pw1', algo: 'md5' })).toBe(md5('100.00:7:pw1'))
  })
})

describe('signaturesMatch', () => {
  it('compares hex case-insensitively', () => {
    expect(signaturesMatch('ABCDEF', 'abcdef')).toBe(true)
    expect(signaturesMatch('abc', 'abd')).toBe(false)
  })
})
