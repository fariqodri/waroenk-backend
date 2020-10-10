import { Repository, EntityRepository } from "typeorm";
import { UserRecovery } from "../entities/user-recovery.entity";

@EntityRepository(UserRecovery)
export class UserRecoveryRepository extends Repository<UserRecovery> {}