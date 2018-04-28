import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SheetbaseConfigService } from './sheetbase-config.service';

import { UserDataService } from './user-data.service';

@Injectable()
export class ApiService {

  constructor(
    private http: HttpClient,

    @Inject(SheetbaseConfigService) private CONFIG,
    private userDataService: UserDataService
  ) {
  }

  /**
   * GET
   * @param endpoint
   * @param params
   */
  GET(
    endpoint: string = null,
    params: any = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {

      if(!this.CONFIG.backend) {
        console.error('[Error][Sheetbase] No backend for this project!');
        reject(null);
      }

      // build uri
      let uri: string = 'https://script.google.com/macros/s/'+ this.CONFIG.backend +'/exec';
      if(endpoint) uri += '?e='+ endpoint;
      if(!endpoint && Object.keys(params||{}).length > 0) uri += '?';
      for(let key in (params||{})) {
        uri += '&'+ key +'='+ params[key];
      }
      if(!endpoint && Object.keys(params||{}).length > 0) uri = uri.replace('?&', '?');

      // get data
      if(!endpoint && Object.keys(params).length < 1) {
        uri += '?apiKey='+ this.CONFIG.apiKey;
      } else {
        uri += '&apiKey='+ this.CONFIG.apiKey;
      }
      if(this.userDataService.token) uri += '&token='+ this.userDataService.token;
      this.http.get<any>(uri).subscribe(data => {
        if(data.error) reject(data);
        resolve(data);        
      }, reject);
    });
  }

  /**
   * POST
   * @param endpoint 
   * @param params 
   * @param body 
   */
  POST(
    endpoint: string = null,
    params: any = {},
    body: any = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!this.CONFIG.backend) {
        console.error('[Error][Sheetbase] No backend for this project!');
        reject(null);
      }

      // build uri
      let uri: string = 'https://script.google.com/macros/s/'+ this.CONFIG.backend +'/exec';
      if(endpoint) uri += '?e='+ endpoint;
      if(!endpoint && Object.keys(params||{}).length > 0) uri += '?';
      for(let key in (params||{})) {
        uri += '&'+ key +'='+ params[key];
      }
      if(!endpoint && Object.keys(params||{}).length > 0) uri = uri.replace('?&', '?');

      // get data
      body = Object.assign({}, body, {
        apiKey: this.CONFIG.apiKey
      });
      if(this.userDataService.token) body.token = this.userDataService.token;
      this.http.post<any>(uri, JSON.stringify(body), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).subscribe(data => {
        if(data.error) reject(data);
        resolve(data);
      }, reject);
    });
  }


}
