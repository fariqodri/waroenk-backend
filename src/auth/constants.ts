import { IS_STAGING_OR_PRODUCTION, JWT_SECRET } from "../constants";

export const jwtConstants = {
  secret: IS_STAGING_OR_PRODUCTION ? JWT_SECRET : 'secretKey',
};