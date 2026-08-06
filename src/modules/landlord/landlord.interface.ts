import { PropertyStatus } from "../../../generated/prisma/enums";



export interface IProperties{
    title:string;
    description:string;
    location:string;
    price:number;
    amenities:string;
    status:PropertyStatus;
    thumbnailImage:string

}

export interface IUpdateProperty{
    title?:string;
    description?:string;
    location?:string;
    price?:number;
    amenities?:string;
      thumbnailImage?:string
}