export interface IContactUsDto {
    id?: string; // Optional property
    email: string; // Immutable in the original record, treated as required here
    name: string; 
    subject: string; 
    message: string; 
    createdDate:Date
  }
  