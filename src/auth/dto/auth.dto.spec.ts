import { validateAsClass } from 'joiful'
import { LoginDto } from './auth.dto'

describe('Auth DTO', () => {
  it('should be valid', () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'example1234'
    }
    const { error } = validateAsClass(loginDto, LoginDto)
    expect(error).toBeNull()
  })

  it('should be invalid', () => {
    const loginDto: LoginDto = {
      email: 'user',
      password: 'example1234'
    }
    const { error } = validateAsClass(loginDto, LoginDto)
    expect(error).not.toBeNull()
  })
})
