import * as jf from 'joiful';

export class RegisterDto {
  @jf.string().required()
  full_name: string

  @jf.string().valid('buyer', 'seller').required()
  role: 'buyer' | 'seller'

  @jf.string().email().required()
  email: string

  @jf.string().regex(new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)).min(7).required()
  phone: string

  @jf.string().required().min(8)
  password: string

  @jf.string().required().min(8)
  confirm_password: string
}

export class editProfileParam {
  @jf.string().optional()
  full_name: string

  @jf.string().email().optional()
  email: string

  @jf.string().regex(new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)).min(7).optional()
  phone: string

  @jf.string().optional().min(8)
  old_password: string
  
  @jf.string().optional().min(8)
  password: string

  @jf.string().optional().min(8)
  confirm_password: string
}

export class RequestOtpParam {
  @jf.string().required()
  email: string
}

export class ResetPasswordParam {
  @jf.string().required()
  email: string

  @jf.string().required()
  otp: string

  @jf.string().required().min(8)
  password: string

  @jf.string().required().min(8)
  confirm_password: string
}

export class ShippingAddressDto {
  @jf.string().optional()
  receiver_name: string;

  @jf.string().regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).optional()
  receiver_phone: string;

  @jf.string().required()
  street: string

  @jf.string().regex(/^[0-9]{1,}\.[0-9]{1,}$/).required()
  city_code: string

  @jf.string().regex(/^[0-9]{1,}\.[0-9]{1,}\.[0-9]{1,}$/).required()
  kecamatan_code: string

  @jf.string().regex(/^[0-9]{1,}\.[0-9]{1,}\.[0-9]{1,}\.[0-9]{1,}$/).required()
  kelurahan_code: string

  @jf.string().required()
  post_code: string
}
