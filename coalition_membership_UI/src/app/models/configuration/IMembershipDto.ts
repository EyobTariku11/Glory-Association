export interface IMembershipTypePostDto {
    id?:string
    name: string;
    shortCode:String
    associationId:string
    counter: number;
    money: number;
    currency : string;
    description: string;
    membershipCategory: string;
    createdById?: string;
  }
  
  export interface IMembershipTypeGetDto {
    id: string;
    name: string;
    shortCode: string;
    associationId: string;
    counter: number;
    money: number;
    currency: string;
    description: string;
    membershipCategory: string;
    createdById: string;
    currencyGet: string;
    membershipCategoryGet: string;
  }

  export interface IRegionRevenueDto {
    regionRevenue:number,
    regionName:string,
    members:number,
    associationId:string,
    associationName:string
  }