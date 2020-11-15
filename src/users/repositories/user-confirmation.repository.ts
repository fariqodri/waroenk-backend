import { Repository, EntityRepository } from "typeorm";
import { UserConfirmation } from "../entities/user-confirmation.entity";

@EntityRepository(UserConfirmation)
export class UserConfirmationRepository extends Repository<UserConfirmation> {}