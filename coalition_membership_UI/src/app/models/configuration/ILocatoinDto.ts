export interface ICountryGetDto {
    id: string;
    countryName: string;
    countryCode: string;
    nationality: string;
  }
  
  export interface ICountryPostDto {
    id?: string;
    countryName: string;
    countryCode: string;
    nationality: string;
    createdById?: string;
  }
  
  export interface IRegionPostDto {
    id?: string;
    regionName: string;
    countryType: string;
    createdById?: string;
    userName?:string;
    password?:string;
  }
  
  export interface IRegionGetDto {
    id: string;
    regionName: string;
    countryName?: string;
    countryType: number;
    countryTypeGet :string;
    userName ?:string;
    password ?:string
  }
  
  export interface IZonePostDto {
    id?: string;
    zoneName: string;
    regionId: string;
    createdById?: string;
  }
  
  export interface IZoneGetDto {
    id: string;
    regionId: string;
    countryId: string;
    countryName: string;
    regionName: string;
    zoneName: string;
  }