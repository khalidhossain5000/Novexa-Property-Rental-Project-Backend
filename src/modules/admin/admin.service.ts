import { Role, UserStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"


const getAllUsersFromDb=async()=>{
const result=await prisma.user.findMany()
return result
}

// update user status
const updateUserStatus=async(status:UserStatus,userId:string)=>{
//s-1 check user exist
const user=await prisma.user.findUniqueOrThrow({where:{id:userId}})

//s-2 if user role is admin then this user cant be ban
if(user.role===Role.ADMIN) throw{status:401,message:"Unauth you cant ban or update status of admin"}
//s-3 update status
const result=await prisma.user.update({
    where:{
        id:userId
    },
    data:{
        status
    }
})
return result
}

// get all properties for admin manage
const getAllPropertiesFromDb=async()=>{
const result=await prisma.properties.findMany({
    include:{
        category:true,
        user:{
            omit:{
                password:true
            }
        },
        rentalRequest:true
    }
})
return result
}

//get all rental request for admin manage
const getAllRentalRequestFromDb=async()=>{
const result=await prisma.rentalRequest.findMany({
    include:{
        property:true,
        
        tenant:{
            omit:{
                password:true
            }
        }
    }
})
return result
}



const getAdminDashboardStatsFromDb = async () => {
  const [
    totalUsersCount,
    totalPropertiesCount,
    totalRentalRequestCount,
    activePropertyCount,
  ] = await prisma.$transaction([
    // total users — regardless of role/status
    prisma.user.count(),

    // total properties — regardless of status
    prisma.properties.count(),

    // total rental requests — regardless of status
    prisma.rentalRequest.count(),

    // active/available properties only
    prisma.properties.count({
      where: {
        status: "AVAILABLE",
      },
    }),
  ]);

  const result = {
    totalUsersCount,
    totalPropertiesCount,
    totalRentalRequestCount,
    activePropertyCount,
  };

  return result;
};
export const adminServices={
    getAllUsersFromDb,
    updateUserStatus,
    getAllPropertiesFromDb,
    getAllRentalRequestFromDb,
    getAdminDashboardStatsFromDb
}