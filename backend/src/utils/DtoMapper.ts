import {UserDto} from "../users/dto/user.dto";
import {plainToInstance} from "class-transformer";
import {UserDocument} from "../users/schemas/user.schema";

export const userToUserDto = (user: UserDocument): UserDto => {
    return plainToInstance(UserDto, user.toObject(), {
        excludeExtraneousValues: true,
    });
}

export const userListToUserDtoList = (userList: UserDocument[]): UserDto[] => {
    return userList.map(user => userToUserDto(user));
}