import { Document } from "mongoose";

export class RegisterUserDto extends Document {
    email: string;
    username: string;
    phoneNumber: string;
    password: string;
}

export class EmailLoginDto {
    email: string;
    password: string;
}

export class PhoneLoginDto {
    phoneNumber: string;
    password: string;
}

export class UpdateUserDto {
    email?: string;
    phoneNumber?: string;
    password?: string;
}

export class Enable2FADto {
    userId: string;
}

export class Verify2FADto {
    userId: string;
    token: string;
}