export interface IAnnouncmentPostDto {
  image?: File;
  title: string;
  description: string;
  epiredDate: Date;
  createdById: string;
}

export interface IAnnouncmentGetDto {
  id: string;
  imagePath?: string;
  image?: File;
  title: string;
  description: string;
  epiredDate: Date;
}
