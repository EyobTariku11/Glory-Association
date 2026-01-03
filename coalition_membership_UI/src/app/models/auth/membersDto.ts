export interface IMembersPostDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  associationId: string;
  RegionId: string;
  membershipTypeId: string;
}

export interface IMembersGetDto {

  id: string;
  fullName: string;
  imagePath: string;
  phoneNumber: string;
  email: string;
  region: string;
  zone: string;
  woreda: string;
  inistitute: string;
  birthDate: string;
  membershipTypeId: string;
  educationalField: string;
  educationalLevel: string;
  lastPaid: Date;
  educationalLevelId: string;
  membershipType: any;
  membershipTypeName?: string;
  memberId: string;
  gender: string;
  instituteRole: string;
  amount: number;
  text_Rn: string;
  expiredDate: Date;
  paymentStatus: string;
  idCardStatus: string;
  rejectedRemark: string;
  isBirthDate: boolean;
  moodleName: string;
  moodlePassword?: string;
  moodleId: string;
  moodleStatus: string;
  createdByDate: Date;
  currency: string;
  regionId?: string;
  memberStatus?:string;
  membershipCategory?: string;
  associationId?: string;
}
export interface ICompletePorfileDto {
  id: string;
  educationalField: string;
  educationalLevelId: string;
  gender: string;
  instituteRole: string;
  birthDate: Date;
}

export interface IMemberUpdateDto {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;

  gender: string;

  birthDate: Date;
  woreda: string;

  regionId? : string

  lastPaid?: Date;
  expiredDate?: Date;
  paymentStatus?: string;

  membershipTypeId?: string;
}

export interface IMemberTelegramDto {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  memberId: string;
  amount: number;
  text_Rn: string;
  expiredDate: Date;
  paymentStatus: Date;
  membershipType: string;
  membershipTypeId: string;
  url: string;
  currency: string;
}

export interface MoodleUpdateDto {
  memberId: string;
  moodleName: string;
  moodlePassword?: string;
  moodleId: string;
}
