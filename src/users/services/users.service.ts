import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { nanoid } from 'nanoid';
import { BUYER_ROLE_ID, SALT_ROUNDS } from '../../constants';
import { LocationEntity } from '../../misc/entities/location.entity';
import { MiscService } from '../../misc/services/misc.service';
import { PermissionService } from '../../permission/permission.service';
import { ResponseBody } from '../../utils/response';
import {
  editProfileParam,
  RegisterDto,
  RequestOtpParam,
  ResetPasswordParam,
  ShippingAddressDto,
  UserActivationParam,
} from '../dto/users.dto';
import { UserRecovery } from '../entities/user-recovery.entity';
import { UserEntity } from '../entities/users.entity';
import { SellerAttributeRepository } from '../repositories/seller.repository';
import { ShippingAddressRepository } from '../repositories/shipping-address.repository';
import { UserRecoveryRepository } from '../repositories/user-recovery.repository';
import { UserConfirmationRepository } from '../repositories/user-confirmation.repository';
import { UserRepository } from '../repositories/users.repository';
import { UserConfirmation } from '../entities/user-confirmation.entity';

@Injectable()
export class UsersService {
  public readonly users: UserEntity[];

  constructor(
    private permissionService: PermissionService,
    private userRepo: UserRepository,
    private userRecoveryRepo: UserRecoveryRepository,
    private userConfirmationRepo: UserConfirmationRepository,
    private sellerRepo: SellerAttributeRepository,
    private shippingRepo: ShippingAddressRepository,
    private miscService: MiscService,
    private readonly mailerService: MailerService
  ) { }

  async activateUser(param: UserActivationParam) {
    const user = await this.userRepo.findOneOrFail({ where: { email: param.email } });
    const userConfirmation = await this.userConfirmationRepo.findOneOrFail({ where: { user: user.id, code: param.code } });
    user.is_active = true;
    await this.userRepo.save(user);
    await this.userConfirmationRepo.delete(userConfirmation)
    return new ResponseBody(null, 'user berhasil diaktifkan')
  }

  async resetPassword(param: ResetPasswordParam) {
    const user = await this.userRepo.findOneOrFail({ where: { email: param.email } })
    const userRecovery = await this.userRecoveryRepo.findOneOrFail({ where: { user: user.id, otp: param.otp } })
    if (param.password != param.confirm_password) {
      throw new BadRequestException(
        new ResponseBody(null, 'confirm password unequal with password'),
      );
    }
    const isNewPasswordSameAsOldPassword = await bcrypt.compare(
      param.password,
      user.password,
    );
    if (isNewPasswordSameAsOldPassword) {
      throw new BadRequestException(
        new ResponseBody(null, 'new password cannot be the same as old password'),
      );
    }
    user.password = await bcrypt.hash(param.password, SALT_ROUNDS);
    await this.userRepo.save(user);
    await this.userRecoveryRepo.delete(userRecovery)
    return new ResponseBody(null, 'password berhasil direset, silahkan login kembali')
  }

  async requestOtp(param: RequestOtpParam) {
    const user = await this.userRepo.findOne({ where: { email: param.email } })
    if (undefined == user) {
      throw new BadRequestException(
        new ResponseBody(null, `user with email ${ param.email } not found`),
      );
    }
    const existingOtp = await this.userRecoveryRepo.findOne({ where: { user: user.id } })
    if (undefined != existingOtp) {
      await this.userRecoveryRepo.delete(existingOtp)
    }
    const newOtp: UserRecovery = {
      user: user,
      otp: nanoid(11)
    }
    await this.userRecoveryRepo.insert(newOtp);
    const link = `https://bukawaroenk.co.id/?email=${param.email}&otp=${newOtp.otp}`;
    const emailContent = `Halo ${user.full_name}!
    <br>
    Kami telah menerima permintaan pengaturan ulang password untuk akun Waroenk UMKM anda.
    <br><br>
    Kode reset anda adalah: ${newOtp.otp} (salin kode ini)
    <br><br>
    Silahkan klik link berikut untuk merubah password anda:
    <br><br>
    <a href="${link}">atur ulang password</a>
    <br><br>
    Mohon untuk tidak membagikan link tersebut ke orang lain. Link tersebut hanya dapat digunakan satu kali.
    <br>
    Jika anda tidak melakukan permintaan ini, anda bisa mengabaikan email ini.
    <br><br>
    ============================================================ 
    <br><br>
    Hi ${user.full_name}!
    <br>
    We received a request to reset your password for your Waroenk UMKM account.
    <br><br>
    Your reset code: ${newOtp.otp} (Copy this code)
    <br><br>
    Simply click on the link to set a new password: 
    <br><br>
    <a href="${link}">reset password</a>
    <br><br>
    Keep this link privately, don't give it to anyone. This link only valid for one-time password reset.
    <br>
    If you didn't ask to reset your password, don't worry! Your account is still safe and you can delete this email.`
    await this.sendMail(user.email, 'Reset Password Waroenk UMKM', emailContent)
    return new ResponseBody(null, "OTP telah dikirimkan ke email")
  }

  async sendMail(email: string, subject: string, param: string) {
    this
      .mailerService
      .sendMail({
        to: email,
        from: 'admin@bukawaroenk.co.id',
        subject: subject,
        text: 'reset password',
        html: param,
      })
      .then((success) => {
        console.log(success)
        return new ResponseBody(success)
      })
      .catch((err) => {
        console.log(err)
        return new ResponseBody(err)
      });
  }

  async editProfile(param: editProfileParam, userId: string): Promise<any> {
    const user = await this.userRepo.findOneOrFail(userId);
    if (user === undefined) {
      throw new NotFoundException(new ResponseBody(null, 'user not found'));
    }
    if (param.email) {
      user.email = param.email;
    }
    if (param.full_name) {
      user.full_name = param.full_name;
    }
    if (param.phone) {
      user.phone = param.phone;
    }
    if (param.password) {
      if (param.password != param.confirm_password) {
        throw new BadRequestException(
          new ResponseBody(null, 'confirm password unequal with password'),
        );
      }
      const isPasswordValid = await bcrypt.compare(
        param.old_password,
        user.password,
      );
      if (isPasswordValid) {
        if (param.old_password == param.password) {
          throw new BadRequestException(
            new ResponseBody(null, 'new password cannot be the same as old password'),
          );
        }
        user.password = await bcrypt.hash(param.password, SALT_ROUNDS);
      } else {
        throw new BadRequestException(
          new ResponseBody(null, 'invalid password'),
        );
      }
    }
    user.updated_at = new Date();
    await this.userRepo.save(user);
    return new ResponseBody(null, 'profile has been updated');
  }

  async findUserById(userId: string): Promise<UserEntity> {
    return this.userRepo.findOneOrFail(userId);
  }

  async findOne(params: { id?: string; email?: string }): Promise<any> {
    try {
      const user = await this.userRepo.findOneOrFail({ where: params });
      const seller = await this.sellerRepo.findOne({
        where: { user: user.id },
      });
      const response = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        is_active: user.is_active,
        sellerId: seller ? seller.id : null,
      };
      return response;
    } catch (err) {
      throw new NotFoundException(new ResponseBody(null, 'user not found'));
    }
  }

  async register(body: RegisterDto): Promise<UserEntity> {
    if (body.password != body.confirm_password) {
      throw new BadRequestException(
        new ResponseBody(null, 'confirm password unequal with password'),
      );
    }
    try {
      const encrypted = await bcrypt.hash(body.password, SALT_ROUNDS);
      const user: UserEntity = {
        id: nanoid(11),
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        password: encrypted,
        role: 'buyer',
        created_at: new Date(),
        updated_at: null,
        is_active: false,
      };
      await this.userRepo.insert(user);
      await this.permissionService.addMemberToRole(user.id, BUYER_ROLE_ID);
      const newConfirmationCode: UserConfirmation = {
        user: user,
        code: nanoid(11)
      }
      await this.userConfirmationRepo.insert(newConfirmationCode);
      const link = `https://bukawaroenk.co.id/#/confirmation-success?email=${user.email}&code=${newConfirmationCode.code}`;
      const emailContent = `Halo ${user.full_name},
      <br><br>
      Silahkan klik link berikut untuk aktivasi akun Waroenk UMKM anda agar dapat login dan melanjutkan transaksi anda:
      <br><br>
      <a href="${link}">aktivasi akun</a>
      <br><br>
      ============================================================
      Hi ${user.full_name},
      <br><br>
      Please click the link below to activate your Waroenk UMKM account so you can log in and continue your transaction:
      <br><br>
      <a href="${link}">activate account</a>`;
      await this.sendMail(user.email, 'Aktivasi Akun Waroenk UMKM', emailContent)
      return plainToClass(UserEntity, user);
    } catch (err) {
      const errMessage: string = err.message;
      if (errMessage.toLowerCase().includes('duplicate entry'))
        throw new BadRequestException(
          new ResponseBody(null, 'email has been taken'),
        );
      throw err;
    }
  }

  async getUserPassword(userId: string): Promise<string> {
    const user = await this.userRepo.findOneOrFail(userId);
    return user.password;
  }

  async updateDeviceToken(
    userId: string,
    deviceToken: string,
  ): Promise<ResponseBody<{ user_id: string; device_token: string }>> {
    await this.userRepo.update(userId, { device_token: deviceToken });
    return new ResponseBody({
      user_id: userId,
      device_token: deviceToken,
    });
  }

  async upsertShippingAddress(
    userId: string,
    shippingAddress: ShippingAddressDto,
  ) {
    let city: LocationEntity;
    let kecamatan: LocationEntity;
    let kelurahan: LocationEntity;
    const user = await this.userRepo.findOneOrFail(userId);
    const receiver_name = shippingAddress.receiver_name
      ? shippingAddress.receiver_name
      : user.full_name;
    const receiver_phone = shippingAddress.receiver_phone
      ? shippingAddress.receiver_phone
      : user.phone;

    try {
      city = await this.miscService.getLocationByCode(
        shippingAddress.city_code,
      );
    } catch {
      throw new BadRequestException(
        new ResponseBody(
          null,
          `city with code ${shippingAddress.city_code} not found`,
        ),
      );
    }
    try {
      kecamatan = await this.miscService.getLocationByCode(
        shippingAddress.kecamatan_code,
      );
    } catch {
      throw new BadRequestException(
        new ResponseBody(
          null,
          `city with code ${shippingAddress.kecamatan_code} not found`,
        ),
      );
    }
    try {
      kelurahan = await this.miscService.getLocationByCode(
        shippingAddress.kelurahan_code,
      );
    } catch {
      throw new BadRequestException(
        new ResponseBody(
          null,
          `city with code ${shippingAddress.kelurahan_code} not found`,
        ),
      );
    }
    const data = {
      receiver_name,
      receiver_phone,
      street: shippingAddress.street,
      city,
      kecamatan,
      kelurahan,
      post_code: shippingAddress.post_code,
      user
    }
    await this.shippingRepo.save(data)
    const { user: _, ...rest } = data
    return rest
  }

  getShippingAddress(userId: string) {
    return this.shippingRepo.createQueryBuilder('shipping')
      .where('userId = :userId', { userId })
      .innerJoin('shipping.city', 'city')
      .innerJoin('shipping.kecamatan', 'kecamatan')
      .innerJoin('shipping.kelurahan', 'kelurahan')
      .select([
        'shipping.receiver_name',
        'shipping.receiver_phone',
        'shipping.street',
        'city.kode',
        'city.nama',
        'kecamatan.kode',
        'kecamatan.nama',
        'kelurahan.kode',
        'kelurahan.nama',
        'shipping.post_code'
      ])
      .getOne()
  }
}
