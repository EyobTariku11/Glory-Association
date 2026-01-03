import { IMemberTelegramDto } from "./auth/membersDto";

export interface ResponseMessage {
  success: boolean;
  message: string;
  data: any;
}
export interface ResponseMessage2 {
  exist: boolean;
  status: string;
  message: string;
  member: IMemberTelegramDto;
}

export interface SelectList {
  id?: string;
  name: string;
  empId?: string;
  amount?: number;
  imagePath?: string;

  code?: number;
  value?: string;
  currency?: number;
  // employeeId ?: string
  // reason?:string
  // photo ?:string
  // commiteeStatus?:string
}

export interface EnumType {
  code: number;
  value: string;
}
// response message
export interface ResponseMessageData<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}

export interface ResponseData<T> {
  data: T;
  metaData: MetaData;
}
export interface MetaData {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
