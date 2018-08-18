import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  user: any;
  token: string;

  constructor(
  ) {
  }

}