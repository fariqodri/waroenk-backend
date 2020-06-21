import { RegisterDto } from "./users.dto";
import { validateAsClass } from 'joiful'

describe('DTO Validation Test', () => {
  it("should accept valid object", () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
      confirm_password: "test123test123"
    }
    const { error } = validateAsClass(registerBody, RegisterDto)
    expect(error).toBeNull()
  })

  it("should reject invalid object", () => {
    const registerBody: RegisterDto = {
      full_name: "Full Name",
      email: "full",
      phone: "123123",
      password: "test12",
      confirm_password: "test12"
    }
    const { error } = validateAsClass(registerBody, RegisterDto)
    expect(error).not.toBeNull()
  })
})
