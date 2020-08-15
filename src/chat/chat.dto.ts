import * as jf from 'joiful';

export class RegisterDeviceDto {
  @jf.string().required()
  device_token: string
}

export class ChatDto {
  @jf.string().required()
  receiver_user_id: string

  @jf.string().regex(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/).required()
  date: string

  @jf.string().regex(/^(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)$/).required()
  time: string

  @jf.string().optional()
  text?: string

  @jf.string().optional()
  order_id?: string

  @jf.string().optional()
  chat_room_id?: string
}
