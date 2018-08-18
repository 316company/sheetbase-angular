import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import { IAppFile, IAppHTTPResponse } from '../misc/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private ngZone: NgZone,

    private apiService: ApiService
  ) {
  }

  get(fileId: string): Observable<IAppHTTPResponse> {
    return this.apiService.GET('/file', {
      id: fileId
    });
  }

  // TODO: https://xkeshi.github.io/image-compressor/
  upload(appFile: IAppFile, customFolder: string = null, customName: string = null): Observable<IAppHTTPResponse> {
    return new Observable(observer => {
      if(!appFile) return observer.error('No local file!');
      let body: any = {
        file: Object.assign(this.base64Breakdown(appFile.base64), {
          name: appFile.name
        })
      }
      if(customFolder) body.folder = customFolder;
      if(customName) body.name = customName;
      this.apiService.POST('/file', {}, body)
        .subscribe(response => {
          observer.next(response);
        }, error => observer.error(error));
    });
  }

  load(file: File): Observable<IAppFile> {
    return new Observable(observer => {
      if(!file) return observer.error(null);
      let reader = new FileReader();
      reader.onload = (e: any) => {
        observer.next({
          name: file.name,
          size: file.size,
          mimeType: file.type,
          base64: e.target.result
        });
      }
      reader.readAsDataURL(file);
    });
  }

  private base64Breakdown(base64Data: string) {
    var breakdownData = base64Data.split(';base64,');
    return {
      mimeType: breakdownData[0].replace('data:', ''),
      base64String: breakdownData[1]
    };
  }



}
