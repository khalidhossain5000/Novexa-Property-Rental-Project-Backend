import { PropertyStatus } from "../../../generated/prisma/enums";
import { PropertiesWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPropertyQuery } from "./properties.interface";

const getAllPropertiesFromDb = async (query: IPropertyQuery) => {
 
  let andConditions: PropertiesWhereInput[] = [];

  //searching logic

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        //search by location
        {
          location: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        //search by amenities
        {
          amenities: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        //search by property type(category)
        {
          category: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        //serach by price range will check later
      ],
    });
  }

  //filter logic
  //filter by location
  if (query.location) {
    andConditions.push({
      location: {
        contains: query.location as string,
        mode: "insensitive",
      },
    });
  }
//filter by type (category)

if(query.type){
    andConditions.push({
        category:{
            name:{
                equals:query.type,
                mode:"insensitive"
            }
        }
    })
}


//filter by price range
if(query.minPrice || query.maxPrice){
    const priceCondition:{
        gte?:number;
        lte?:number;
    }={}

    if(query.minPrice){
        priceCondition.gte=Number(query.minPrice)
    }
    if(query.maxPrice){
        priceCondition.lte=Number(query.maxPrice)
    }
    andConditions.push({price:priceCondition})
}
  const propertiesResult = await prisma.properties.findMany({
    where: {
      AND: andConditions,
      status:PropertyStatus.AVAILABLE
    },

    include: {
      category: true,
      user: {
        omit: {
          password: true,
        },
      },
       reviews:true
    },
  });
  return propertiesResult;
};


//get property details 
const getSinglePropertyFromDb=async(id:string)=>{
const result=await prisma.properties.findUniqueOrThrow({
  where:{id},
  include:{
    category:true,
    user:{
      omit:{password:true}
    },
    rentalRequest:true,
    reviews:true
  }
})
return result
}

export const propertiesServices = {
  getAllPropertiesFromDb,
  getSinglePropertyFromDb
};
