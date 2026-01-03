
export interface CompanyProfilePostDto {
    title: string;
    dashboardImage: File; // Equivalent to IFormFile
    aboutUsLogoPath: File; // Equivalent to IFormFile
    description: string;
    aboutUs: string;
    createdById: string;

    localTitle:string
    localDescription : string
    localAboutUs:string
    facebook: string;
    telegram: string;
    tiktok: string;
    associationId?: string;
  }
  
  export interface CompanyProfileGetDto extends CompanyProfilePostDto {
    id: string; // Guid in C# maps to string in TypeScript
    dashboardImagePath: string;
    aboutLogoPath: string;
    membersCount: number;
    donationCount:number;

    eventsPerYear: number;
  }
  