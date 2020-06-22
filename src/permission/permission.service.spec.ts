import { Test } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { nanoid } from 'nanoid';
import { BUYER_ROLE_ID, PERMISSION_FLAVOR } from '../constants';

describe("Permission Service", () => {
  let service: PermissionService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PermissionService]
    }).compile()
    service = module.get(PermissionService)
  })

  it("should check if role exists", async () => {
    let getSpy = jest.spyOn(service.axiosInstance, "get").mockImplementation(async () => ({
      status: 200,
      data: {
        id: "role"
      }
    }))
    jest.spyOn(service.axiosInstance, "put").mockImplementation(async () => ({
      status: 200,
      data: {
        id: "role"
      }
    }))
    const userId = nanoid(11)

    await service.addMemberToRole(userId, BUYER_ROLE_ID)
    expect(getSpy).toBeCalledWith(`/engines/acp/ory/${PERMISSION_FLAVOR}/roles/${BUYER_ROLE_ID}`)
  })

  it("should create role first if role does not exist", async () => {
    jest.spyOn(service.axiosInstance, "get").mockImplementation(async () => ({
      status: 404
    }))
    const putSpy = jest.spyOn(service.axiosInstance, "put").mockImplementation(async () => ({
      status: 200,
      data: {
        id: BUYER_ROLE_ID
      }
    }))
    const userId = nanoid(11)
    await service.addMemberToRole(userId, BUYER_ROLE_ID)
    expect(putSpy).toHaveBeenNthCalledWith(1, `/engines/acp/ory/${PERMISSION_FLAVOR}/roles`, { id: BUYER_ROLE_ID })
  })

  it("should add member to existing role", async () => {
    jest.spyOn(service.axiosInstance, "get").mockImplementation(async () => ({
      status: 200,
      data: {
        id: BUYER_ROLE_ID
      }
    }))
    const putSpy = jest.spyOn(service.axiosInstance, "put").mockImplementation(async () => ({
      status: 200,
      data: {
        id: BUYER_ROLE_ID
      }
    }))
    const userId = nanoid(11)
    await service.addMemberToRole(userId, BUYER_ROLE_ID)
    expect(putSpy).toHaveBeenNthCalledWith(1, `/engines/acp/ory/${PERMISSION_FLAVOR}/roles/${BUYER_ROLE_ID}/members`, {
      members: [userId]
    })
  })
})
