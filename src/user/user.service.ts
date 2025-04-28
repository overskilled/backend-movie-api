// user.service.ts
import {
    Injectable,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { User } from '../schemas/users.schema';
import {
    EmailLoginDto,
    PhoneLoginDto,
    RegisterUserDto,
    UpdateUserDto,
    Enable2FADto,
    Verify2FADto,
} from '../common/dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async register(registerDto: RegisterUserDto): Promise<{ message: string, id: string }> {
        const { email, phoneNumber } = registerDto;

        // Check for existing email separately
        const existingEmailUser = await this.userModel.findOne({ email }).exec();
        if (existingEmailUser) {
            throw new ConflictException({
                statusCode: 409,
                message: 'Registration failed',
                errors: {
                    email: 'This email is already registered'
                }
            });
        }

        // // Check for existing phone number separately
        // const existingPhoneUser = await this.userModel.findOne({ phoneNumber }).exec();
        // if (existingPhoneUser) {
        //     throw new ConflictException({
        //         statusCode: 409,
        //         message: 'Registration failed',
        //         errors: {
        //             phoneNumber: 'This phone number is already registered'
        //         }
        //     });
        // }

        const hashedPassword = await this.hashPassword(registerDto.password);
        const newUser = new this.userModel({
            email,
            username: registerDto.username,
            is2FAEnabled: false,
            phoneNumber: registerDto.phoneNumber,
            twoFASecret: null,
            password: hashedPassword,
            createdAt: new Date(),
        });

            
        const savedUser = await newUser.save();
        if (!savedUser) {
            throw new ConflictException({
                statusCode: 409,
                message: 'Registration failed',
                errors: {
                    email: 'This email is already registered'
                }
            });
        }

        return {
            message: 'Registration successful. Please verify your email.',
            id: savedUser.id.toString()
        };
    }

    async emailLogin(loginDto: EmailLoginDto) {
        const user = await this.userModel.findOne({ email: loginDto.email });

        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.handleLoginResponse(user);
    }

    async phoneLogin(loginDto: PhoneLoginDto) {
        const user = await this.userModel.findOne({ phoneNumber: loginDto.phoneNumber });

        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.handleLoginResponse(user);
    }

    private async handleLoginResponse(user: User) {
        if (user.is2FAEnabled) {
            const tempToken = this.jwtService.sign(
                {
                    sub: user._id,
                    isTempToken: true,
                },
                { expiresIn: '20m' },
            );
            return {
                tempToken,
                twoFARequired: true,
                message: '2FA required. Please verify with your authenticator app',
            };
        }

        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
            userId: user._id,
            twoFARequired: false,
        };
    }

    async generate2FASecret(enable2FADto: Enable2FADto) {
        const user = await this.findUserById(enable2FADto.userId);

        const secret = speakeasy.generateSecret({
            name: `YourApp (${user.email})`,
            length: 20,
        });

        user.twoFASecret = secret.base32;
        await user.save();

        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url,
        };
    }

    async verify2FACode(verify2FADto: Verify2FADto) {
        const user = await this.findUserById(verify2FADto.userId);

        const isValid = speakeasy.totp.verify({
            secret: user.twoFASecret,
            encoding: 'base32',
            token: verify2FADto.token,
        });

        if (!isValid) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
        };
    }

    private generateAccessToken(user: User): string {
        return this.jwtService.sign({
            sub: user._id,
            email: user.email,
            twoFAEnabled: user.is2FAEnabled,
            twoFAVerified: user.is2FAEnabled ? false : undefined,
        });
    }

    private generateRefreshToken(user: User): string {
        return this.jwtService.sign(
            { sub: user._id },
            { expiresIn: '7d' },
        );
    }

    async findAllUsers(): Promise<User[]> {
        return this.userModel.find({}, { password: 0, twoFASecret: 0 }).exec();
    }

    async findUserById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateUser(id: string, updateDto: UpdateUserDto): Promise<User | null> {
        const user = await this.findUserById(id);

        if (updateDto.password) {
            updateDto.password = await this.hashPassword(updateDto.password);
        }

        return this.userModel.findByIdAndUpdate(
            id,
            { $set: updateDto },
            { new: true },
        ).exec();
    }

    async deleteUser(id: string): Promise<void> {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('User not found');
        }
    }
}