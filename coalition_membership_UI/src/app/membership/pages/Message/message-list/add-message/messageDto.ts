export interface IMessagePostDto {
  content: string;
  messageTypes: string[];
}

export interface ImessageGetDto extends IMessagePostDto {
  messageId: string;
  messageTypeGet: string;
  isApproved: boolean;
}


export interface EventMessageMemberPostDto {
  memberIds?: string[]; // Guid is represented as a string in TypeScript
  membershipIds?: string[]; // Optional arrays
  forAllMembers: boolean; 
  eventMessageId: string; 
  messageStatus?: MessageStatus; // Assuming MessageStatus is an enum or type defined elsewhere
}

export interface EventMessageMemberGetDto extends EventMessageMemberPostDto {
  memberName: string; 
  memberPhoneNumber: string; 
  messageContent: string; 
  messageStatusGet: string; 
  eventMessageMemberId:string;
  messageTypeGet:string
}

export enum MessageStatus {
  Pending = '0',
  Sent = '1'
}

export interface MessageTypeEnumDto{
  value:string,
  code:number
}

