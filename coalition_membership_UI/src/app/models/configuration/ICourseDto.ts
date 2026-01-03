export interface ICoursePostDto {
  fileName: string;
  description: string;
  file?: File;
  membershipTypeId: string;
  createdById: string;
}

export interface ICourseGetDto {
  id: string;
  fileName: string;
  description: string;
  filePath: string;
  membershipType: string;
  membershipTypeId: string;
  createdAt:string
}
