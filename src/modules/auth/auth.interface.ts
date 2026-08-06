import { Role, UserStatus } from "../../../generated/prisma/enums"
export interface IUser{
    firstName:string,
    lastName:string,
    email:string,
    password:string,
    role:Role,
    status:UserStatus,
    profileImage?:string
}