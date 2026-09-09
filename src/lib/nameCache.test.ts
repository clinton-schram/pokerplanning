import { beforeEach, describe, expect, it } from 'vitest'
import { getCachedUserName, saveCachedUserName } from './nameCache'

describe('nameCache', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns null when no value exists', () => {
    expect(getCachedUserName()).toBeNull()
  })

  it('saves and returns the cached username', () => {
    saveCachedUserName(' Alice ')
    expect(getCachedUserName()).toBe('Alice')
  })
})
