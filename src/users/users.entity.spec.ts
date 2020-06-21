import { UserEntity } from './users.entity'
import { plainToClass } from 'class-transformer'

describe("User Entity", () => {
  it("should exclude password", () => {
    const responseUser: UserEntity = {
      id: "id_1",
      full_name: "Full Name",
      email: "full@example.com",
      phone: "08123211231",
      password: "test123test123",
    }
    const user = plainToClass(UserEntity, responseUser)
    expect(user.password).toBeUndefined()
  })
})
