import { Injectable } from "@nestjs/common";
import Axios, { AxiosInstance } from "axios";
import { PERMISSION_FLAVOR, PERMISSION_SYSTEM_BASE_URL } from "../constants";

@Injectable()
export class PermissionService {
  public readonly axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = Axios.create({
      baseURL: PERMISSION_SYSTEM_BASE_URL
    })
  }

  async addMemberToRole(userId: string, roleId: string) {
    try{
      const isRoleExist = await this.isRoleExist(roleId)
      if (!isRoleExist) {
        await this.createRole(roleId)
      }
      
      const addMemberResponse = await this.axiosInstance.put(`/engines/acp/ory/${PERMISSION_FLAVOR}/roles/${roleId}/members`, {
        members: [userId]
      })
      return addMemberResponse.data
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data)
      } else if (err.request) {
        throw new Error(err.request)
      }
      throw new Error(err)
    }
  }

  private async isRoleExist(roleId: string): Promise<boolean> {
    try {
      const checkRoleResponse = await this.axiosInstance.get(`/engines/acp/ory/${PERMISSION_FLAVOR}/roles/${roleId}`)
      return checkRoleResponse.status === 200
    } catch(err) {
      return false
    }
  }

  private async createRole(roleId: string): Promise<void> {
    await this.axiosInstance.put(`/engines/acp/ory/${PERMISSION_FLAVOR}/roles`, { id: roleId })
  }
}
