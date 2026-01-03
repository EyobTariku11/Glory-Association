import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SelectList } from '../models/ResponseMessage.Model';


@Injectable({
  providedIn: 'root'
})
export class DropDownService {
  baseUrl: string = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getContriesDropdown() {
    return this.http.get<SelectList[]>(this.baseUrl + '/DropDown/GetCountryDropdownList');
  }

  getRegionsDropdown(countryType: string) {
    return this.http.get<SelectList[]>(this.baseUrl + '/DropDown/GetRegionDropdownList?type=' + countryType);
  }

  getZonesDropdown(regionId: string) {
    return this.http.get<SelectList[]>(this.baseUrl + '/DropDown/GetZoneDropdownList?regionId=' + regionId);
  }

  //   getEducationFieldDropdown() {
  //     return this.http.get<SelectList[]>(this.baseUrl + '/DropDown/GetEducationalFieldDropDown');
  //   }

  getEducationLevelDropdown() {
    return this.http.get<SelectList[]>(this.baseUrl + '/DropDown/GetEducationalLevelDropDown');
  }
  getMembershipDropDown(category: string) {
    return this.http.get<SelectList[]>(this.baseUrl + `/DropDown/GetMembershipDropDown?associationId=${category}`);
  }
}
