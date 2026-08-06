import { RentalRequestStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"
import { IProperties, IUpdateProperty } from "./landlord.interface"



const createPropertiesInDb=async(payload:IProperties,landLordId:string,categoryId:string)=>{
   
const result=await prisma.properties.create({
    data:{
        ...payload,
        landLordId,
        categoryId
    }
})
return result
}
//get curretn logged in landlord all properties that he added

const getLandlordAllProperties=async(landLordId:string,isLandLord:boolean)=>{
     if(!isLandLord) throw {statusCode:409 ,message:"Unauth access you dont have permission for this"}

     const result=await prisma.properties.findMany({
        where:{
            user:{
                id:landLordId
            },
            
        },
        include:{
             category: true,
      user: {
        omit: {
          password: true,
        },
      },
      reviews:true
        }
     })
     return result
}



//get all rental request for landlord management
const getAllRentalRequestFromDb=async(landLordId:string,isLandLord:boolean)=>{

    if(!isLandLord) throw {statusCode:409 ,message:"Unauth access you dont have permission for this"}
    const result=await prisma.rentalRequest.findMany({
        where:{
            property:{
                landLordId
            }
        },
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

//update property
const updatePropertyInDb=async(payload:IUpdateProperty,propertyId:string ,landLordId:string ,isLandlord:boolean)=>{
const property=await prisma.properties.findUniqueOrThrow({where:{id:propertyId}})

if(!isLandlord && property.landLordId!==landLordId)  throw {statusCode:401 , message:"Your dont have permission to update" }



const updateResult=await prisma.properties.update({
    where:{id:propertyId},
    data:{
        ...payload
    },
    include:{
        user:{
            omit:{
                password:true
            }
        },
        category:true
    }
})
return updateResult



}
//update status by llandlord
const updateRentalReqStatusInDb=async(reqId:string,status:RentalRequestStatus)=>{
    console.log(status)
const rentReq=await prisma.rentalRequest.findUniqueOrThrow({
    where:{id:reqId}
})

const result=await prisma.rentalRequest.update({
    where:{id:rentReq.id},
    data:{
        status
    }
})


return result





}
//delete property
const deletePropertyInDb=async(id:string,landLordId:string)=>{

const property=await prisma.properties.findUniqueOrThrow({
    where:{id}
})

if(property.landLordId!==landLordId) throw {statusCode:401,message:"You dont have permission"}


const result=await prisma.properties.delete({
    where:{id}
})
return result
}


//landlod dashboard stats

// get landlord dashboard stats — total rent requests, active rent, total earnings, total properties
const getLandlordDashboardStatsFromDb = async (landLordId: string) => {
  const [totalRentReq, totalActiveRent, totalEarnAgg, totalPropertiesAdded] =
    await prisma.$transaction([
      // total rental requests received (all statuses combined)
      prisma.rentalRequest.count({
        where: {
          property: {
            landLordId,
          },
        },
      }),

      // total currently active rents
      prisma.rentalRequest.count({
        where: {
          property: {
            landLordId,
          },
          status: "ACTIVE",
        },
      }),

      // total earnings — sum of completed payments for this landlord's properties
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          rentalRequest: {
            property: {
              landLordId,
            },
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // total properties added by this landlord
      prisma.properties.count({
        where: {
          landLordId,
        },
      }),
    ]);

  const result = {
    totalRentReq,
    totalActiveRent,
    totalEarn: totalEarnAgg._sum.totalAmount || 0,
    totalPropertiesAdded,
  };

  return result;
};

export const propertiesServices={
createPropertiesInDb,
updatePropertyInDb,
deletePropertyInDb,
getAllRentalRequestFromDb,
updateRentalReqStatusInDb,
getLandlordAllProperties,
getLandlordDashboardStatsFromDb
}