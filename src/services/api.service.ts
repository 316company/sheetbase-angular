import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SheetbaseConfigService } from './sheetbase-config.service';

import { UserDataService } from './user-data.service';

import { IAppHTTPResponse } from '../misc/interfaces';

@Injectable({
  providedIn: 'root'
})
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
  ): Observable<IAppHTTPResponse> {
    return new Observable(observer => {
      if(!this.CONFIG.backendUrl) {
        return observer.error('[Error][Sheetbase] No backend for this project!');
      }

      // build uri
      let uri: string = this.CONFIG.backendUrl;
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
      this.http.get<IAppHTTPResponse>(uri).subscribe(data => {
        if(data.error) return observer.error(data);
        observer.next(data);
      }, error => observer.error(error));
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
  ): Observable<IAppHTTPResponse> {
    return new Observable(observer => {
      if(!this.CONFIG.backendUrl) {
        return observer.error('[Error][Sheetbase] No backend for this project!');
      }

      // build uri
      let uri: string = this.CONFIG.backendUrl;
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
      this.http.post<IAppHTTPResponse>(uri, JSON.stringify(body), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).subscribe(data => {
        if(data.error) return observer.error(data);
        observer.next(data);
      }, error => observer.error(error));
    });
  }


}
