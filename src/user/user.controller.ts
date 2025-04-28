// user.controller.ts
import {
    Body,
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    UnauthorizedException,
    UseGuards,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
    EmailLoginDto,
    PhoneLoginDto,
    RegisterUserDto,
    UpdateUserDto,
    Enable2FADto,
    Verify2FADto,
} from '../common/dto';
import { User } from 'src/schemas/users.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorGuard } from './guards/two-factor.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    async register(
        @Body() registerDto: RegisterUserDto
    ): Promise<{ message: string; userId: string }> {
        const { id } = await this.userService.register(registerDto);
        return {
            message: 'Registration successful. Please verify your email.',
            userId: id
        };
    }

    @Post('login/email')
    async emailLogin(@Body() loginDto: EmailLoginDto): Promise<{
        tempToken?: string;
        twoFARequired: boolean;
        message?: string;
    }> {
        return this.userService.emailLogin(loginDto);
    }

    @Post('login/phone')
    async phoneLogin(@Body() loginDto: PhoneLoginDto): Promise<{
        tempToken?: string;
        twoFARequired: boolean;
        message?: string;
    }> {
        return this.userService.phoneLogin(loginDto);
    }

    @Post('2fa/generate')
    @UseGuards(JwtAuthGuard)
    async generate2FASecret(@Body() enable2FADto: Enable2FADto): Promise<{
        otpauthUrl: string;
        secret: string;
    }> {
        return this.userService.generate2FASecret(enable2FADto);
    }

    @Post('2fa/verify')
    @UseGuards(TwoFactorGuard)
    async verify2FACode(@Body() verify2FADto: Verify2FADto): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        return this.userService.verify2FACode(verify2FADto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(): Promise<{ message: string }> {
        return { message: 'Logout successful' };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllUsers(): Promise<User[]> {
        try {
            const users = await this.userService.findAllUsers();
            if (!users || users.length === 0) {
                throw new NotFoundException('No users found');
            }
            return users;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Database operation failed');
        }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getUserById(@Param('id') id: string): Promise<User> {
        return this.userService.findUserById(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateUser(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserDto,
    ): Promise<User | null> {
        return this.userService.updateUser(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
        await this.userService.deleteUser(id);
        return { message: 'User successfully deleted' };
    }
}