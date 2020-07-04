import { UserEntity } from './users.entity'
import { plainToClass } from 'class-transformer'

describe("User Entity", () => {
  it("should exclude password", () => {
    const responseUser: UserEntity = {
      id: "id_1",
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      role: "buyer",
      password: "test123test123",
      created_at: new Date(),
      updated_at: null,
      is_active: true
    }
    const user = plainToClass(UserEntity, responseUser)
    expect(user.password).toBeUndefined()
  })
})
