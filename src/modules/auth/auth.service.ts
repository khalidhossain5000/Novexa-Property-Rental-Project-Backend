import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IUpdateUser, IUser } from "./auth.interface";
import httpStatus from "http-status";
import configuration from "../../config";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwtUtils";
import { UserStatus } from "../../../generated/prisma/enums";
const createUserInDb = async (payload: IUser) => {
  const { firstName, lastName, email, password, status, role } = payload;

  //s-1 check if user already exist or not
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user)
    throw {
      statusCode: 409,
      name: "ConflictError",
      message: "User Already Exist ,Please Login",
    };

  //s-2 hash passowrd

  const hashPassword = await bcrypt.hash(
    password,
    Number(configuration.bcrypt_salt_round),
  );

  //s-3 password secured create user now

  const result = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashPassword,
      status,
      role,
    },
    omit: {
      password: true,
    },
  });
  return result;
};

//login user in db
const loginUserInDb = async (email: string, password: string) => {
  //s-1 check if user exist or not
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user)
    throw {
      statusCode: httpStatus.NOT_FOUND,
      name: "Not Found Error",
      message: "User Not Found, Register First",
    };
  //s-2 user exist now check the password

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword)
    throw {
      statusCode: httpStatus.UNAUTHORIZED,
      name: "Unauthorized",
      message: "Invalid Password Try Again",
    };

  //s-3 now user all info are correct generate token

  const jwtPayload = {
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  //access tokena and refresh token

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    configuration.jwt_access_secret,
    configuration.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    configuration.jwt_refresh_access_secret,
    configuration.jwt_refresh_expires_in as SignOptions,
  );
  return { accessToken, refreshToken };
};

//get me from db
const getCurrentUserFromDb = async (id: string) => {
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id },
    omit: { password: true },
  });
  return currentUser;
};

//update user profile
const updateUserProfile=async(id:string,payload:IUpdateUser)=>{
const result=await prisma.user.update({
  where:{
    id
  },
  data:{
    firstName:payload.firstName,
    lastName:payload.lastName,
    profilePhoto:payload.profilePhoto
  },
  
})
return result
}





//refresh token

const refreshToken = async (token: string) => {
  //decode refresh token and match validate info
  const verifiedToken = jwtUtils.verifyToken(
    token,
    configuration.jwt_refresh_access_secret,
  );
  if (!verifiedToken.success) throw new Error(verifiedToken?.error);
  const { name, id, email, role } = verifiedToken.data as JwtPayload;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
      email,
    },
  });

  if (!user) throw new Error("User is not exist please register first");

  if (user.status === UserStatus.BAN) throw new Error("User is banned ");

  const jwtPayload = {
    name,
    id,
    email,
    role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    configuration.jwt_access_secret,
    configuration.jwt_access_expires_in as SignOptions,
  );

  return accessToken;
};

export const authServices = {
  createUserInDb,
  loginUserInDb,
  getCurrentUserFromDb,
  refreshToken,
  updateUserProfile
};
