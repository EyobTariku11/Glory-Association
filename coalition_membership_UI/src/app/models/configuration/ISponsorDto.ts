export interface ISponsorDto {
  id?: number;
  name: string;
  imagePath?: string;
  websiteUrl?: string;
  isActive: boolean;
  createdDate?: Date;
  updatedDate?: Date;
}

export interface ISponsorGetDto {
  id: number;
  name: string;
  imagePath: string;
  websiteUrl: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

export interface ICreateSponsorDto {
  name: string;
  imagePath?: string;
  websiteUrl?: string;
  isActive: boolean;
}

export interface IUpdateSponsorDto {
  id: number;
  name: string;
  imagePath?: string;
  websiteUrl?: string;
  isActive: boolean;
} 