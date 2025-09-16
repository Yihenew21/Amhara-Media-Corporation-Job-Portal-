import { describe, it, expect } from 'vitest'
import { handleApiError, ApiError, ErrorCode, getErrorMessage } from '../errors'

describe('Error Handling', () => {
  describe('handleApiError', () => {
    it('handles generic Error objects', () => {
      const error = new Error('Test error message')
      const result = handleApiError(error)
      
      expect(result).toBeInstanceOf(ApiError)
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR)
      expect(result.message).toBe('Test error message')
    })

    it('handles string errors', () => {
      const error = 'String error message'
      const result = handleApiError(error)
      
      expect(result).toBeInstanceOf(ApiError)
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR)
      expect(result.message).toBe('String error message')
    })

    it('handles network errors', () => {
      const error = new TypeError('fetch is not defined')
      const result = handleApiError(error)
      
      expect(result).toBeInstanceOf(ApiError)
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR)
      expect(result.message).toContain('Unable to connect to the server')
    })

    it('handles PostgrestError with unique violation', () => {
      const postgrestError = {
        code: '23505',
        message: 'duplicate key value',
        details: 'Key already exists',
        hint: 'Use different value'
      }
      
      const result = handleApiError(postgrestError)
      
      expect(result).toBeInstanceOf(ApiError)
      expect(result.code).toBe(ErrorCode.CONFLICT)
      expect(result.message).toBe('A record with these details already exists.')
    })
  })

  describe('getErrorMessage', () => {
    it('extracts message from ApiError', () => {
      const error = new ApiError(ErrorCode.NOT_FOUND, 'Resource not found')
      const message = getErrorMessage(error)
      
      expect(message).toBe('Resource not found')
    })

    it('extracts message from generic Error', () => {
      const error = new Error('Generic error')
      const message = getErrorMessage(error)
      
      expect(message).toBe('Generic error')
    })

    it('handles string errors', () => {
      const message = getErrorMessage('String error')
      expect(message).toBe('String error')
    })

    it('provides fallback for unknown error types', () => {
      const message = getErrorMessage(null)
      expect(message).toBe('An unexpected error occurred')
    })
  })
})
