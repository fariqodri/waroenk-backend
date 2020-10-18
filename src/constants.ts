export const SALT_ROUNDS = 11
export const BUYER_ROLE_ID = "buyer"
export const SELLER_ROLE_ID = "seller"
export const PERMISSION_FLAVOR = "exact"
export const PERMISSION_SYSTEM_BASE_URL = process.env.PERMISSION_SYSTEM_BASE_URL
export const REDIS_URL = process.env.REDIS_URL
export const REDIS_PORT = parseInt(process.env.REDIS_PORT)
export const REDIS_HOST = process.env.REDIS_HOST
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD
export const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID
export const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME
export const FIREBASE_DATABASE_URL = 'https://waroenk-umkm.firebaseio.com'
export const MINIMUM_SELLER_TIER_FOR_POSTING = 2
export const JWT_SECRET = process.env.JWT_SECRET
export const IS_STAGING_OR_PRODUCTION = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production'
