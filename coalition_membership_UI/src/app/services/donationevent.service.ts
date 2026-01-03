import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ResponseMessageData } from "../models/ResponseMessage.Model";
import { DonationEventGetDto } from "../models/configuration/IdonationDto";

@Injectable({
  providedIn: "root",
})
export class DonationEventService {
  private readonly baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ResponseMessageData<DonationEventGetDto[]>>(
      `${this.baseUrl}/DonationEvents/GetAll`
    );
  }

  getById(id: string){
    return this.http.get<ResponseMessageData<DonationEventGetDto>>(`${this.baseUrl}/DonationEvents/GetById/${id}`);
  }

  add(donationEvent: FormData) {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/DonationEvents/Add`,
      donationEvent
    );
  }

  update(id: string, donationEvent: FormData) {
    return this.http.put<ResponseMessageData<string>>(
      `${this.baseUrl}/DonationEvents/Update?id=${id}`,
      donationEvent
    );
  }

  remove(id: string) {
    return this.http.delete<ResponseMessageData<string>>(
      `${this.baseUrl}/DonationEvents/Remove?id=${id}`
    );
  }
}
