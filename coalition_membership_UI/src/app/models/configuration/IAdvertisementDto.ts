export interface IAdvertisementDto {
  id?: string;
  title: string;
  description?: string;
  imagePath: string;
  linkUrl?: string;
  type: AdvertisementType;
  position: AdvertisementPosition;
  isActive: boolean;
  displayOrder: number;
  startDate: Date;
  endDate?: Date;
  clickCount?: number;
  viewCount?: number;
  createdDate?: Date;
  updatedDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  showOnHomepage: boolean;
  showOnNewsPage: boolean;
  showOnEventsPage: boolean;
  showOnClubsPage: boolean;
  lastViewed?: Date;
  lastClicked?: Date;
}

export interface IAdvertisementGetDto {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  linkUrl?: string;
  type: AdvertisementType;
  position: AdvertisementPosition;
  isActive: boolean;
  displayOrder: number;
  startDate: Date;
  endDate?: Date;
  clickCount: number;
  viewCount: number;
  createdDate: Date;
  updatedDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  showOnHomepage: boolean;
  showOnNewsPage: boolean;
  showOnEventsPage: boolean;
  showOnClubsPage: boolean;
  lastViewed?: Date;
  lastClicked?: Date;
}

export interface ICreateAdvertisementDto {
  title: string;
  description?: string;
  imagePath: string;
  linkUrl?: string;
  type: AdvertisementType;
  position: AdvertisementPosition;
  isActive: boolean;
  displayOrder: number;
  startDate: Date;
  endDate?: Date;
  showOnHomepage: boolean;
  showOnNewsPage: boolean;
  showOnEventsPage: boolean;
  showOnClubsPage: boolean;
}

export interface IUpdateAdvertisementDto {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  linkUrl?: string;
  type: AdvertisementType;
  position: AdvertisementPosition;
  isActive: boolean;
  displayOrder: number;
  startDate: Date;
  endDate?: Date;
  showOnHomepage: boolean;
  showOnNewsPage: boolean;
  showOnEventsPage: boolean;
  showOnClubsPage: boolean;
}

export interface IAdvertisementDisplayDto {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  linkUrl?: string;
  type: AdvertisementType;
  position: AdvertisementPosition;
  displayOrder: number;
}

export interface IAdvertisementAnalyticsDto {
  id: string;
  title: string;
  clickCount: number;
  viewCount: number;
  lastViewed?: Date;
  lastClicked?: Date;
  createdDate: Date;
  clickThroughRate: number;
}

// Interface for API response with string type and position
export interface IAdvertisementApiDto {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  linkUrl?: string;
  type: string; // "banner", "sidebar", "popup", "inline", "footer", "header"
  position: string; // "top", "bottom", "left", "right", "center", "header", "footer", "sidebar", "inline"
  displayOrder: number;
}

export enum AdvertisementType {
  Banner = 1,
  Sidebar = 2,
  Popup = 3,
  Inline = 4,
  Footer = 5,
  Header = 6
}

export enum AdvertisementPosition {
  Top = 1,
  Bottom = 2,
  Left = 3,
  Right = 4,
  Center = 5,
  Header = 6,
  Footer = 7,
  Sidebar = 8,
  Inline = 9
} 