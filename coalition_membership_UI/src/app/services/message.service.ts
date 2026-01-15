import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { environment } from "src/environments/environment";
import {
  EventMessageMemberGetDto,
  EventMessageMemberPostDto,
  ImessageGetDto,
  IMessagePostDto,
} from "../membership/pages/Message/message-list/add-message/messageDto";
import { ResponseMessageData } from "../models/ResponseMessage.Model";

@Injectable({
  providedIn: "root",
})
export class EventMessageService {
  baseUrl: string = environment.baseUrl;
  baseUrlPdf: string = environment.baseUrl;
  constructor(private http: HttpClient) { }

  addMessage(fromData: IMessagePostDto) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl + "/EventMessages/AddEventMessage",
      fromData
    );
  }

  updateMessage(fromData: IMessagePostDto) {
    return this.http.put<ResponseMessageData<string>>(
      this.baseUrl + "/EventMessages/UpdateEventMessage",
      fromData
    );
  }

  getMessages(isApproved: boolean) {
    return this.http.get<ResponseMessageData<ImessageGetDto[]>>(
      this.baseUrl + `/EventMessages/GetEventMessage?isApproved=${isApproved}`
    );
  }




  getUnsentMessages(isSent: boolean) {
    return this.http.get<ResponseMessageData<EventMessageMemberGetDto[]>>(
      this.baseUrl + `/EventMessages/GetUnsentMessages?isSent=${isSent}`
    );
  }


  getMessageMembers(messageStatus: number, eventMessageId: string) {
    return this.http.get<ResponseMessageData<EventMessageMemberGetDto[]>>(
      this.baseUrl +
      `/EventMessages/GetEventMessageMember?messageStatus=${messageStatus}&eventMessageId=${eventMessageId}`
    );
  }

  addMessageMembers(eventMessageMemberPostDto: EventMessageMemberPostDto) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl +
      `/EventMessages/AddEventMessageMember`, eventMessageMemberPostDto
    );
  }

  changeMessageStatus(memberIds: string[]) {
    return this.http.put<ResponseMessageData<string>>(
      this.baseUrl +
      `/EventMessages/ChangeMessageStatus`, memberIds
    );
  }

  approveMessage(messageId: string) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl + `/EventMessages/${messageId}/approve`,
      {}
    );
  }

  rejectMessage(messageId: string, reason?: string) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl + `/EventMessages/${messageId}/reject`,
      reason || null
    );
  }

  deleteEventMessage(messageId: string) {
    return this.http.delete<ResponseMessageData<string>>(
      this.baseUrl + `/EventMessages/${messageId}`
    );
  }

}
