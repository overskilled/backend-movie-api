import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsStrongPassword } from "class-validator";
import { Document } from "mongoose";

@Schema({
    collection: 'users', toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.twoFASecret;
            return ret;
        }
    }

})
export class User extends Document {
    @Prop()
    username: string;

    @Prop()
    @IsEmail()
    email: string;

    @Prop()
    @IsPhoneNumber()
    phoneNumber: string;

    @Prop()
    @IsStrongPassword()
    password: string;

    @Prop()
    is2FAEnabled: boolean;

    @Prop()
    twoFASecret: string;

    @Prop()
    createdAt: Date;



}

export const UserSchema = SchemaFactory.createForClass(User);