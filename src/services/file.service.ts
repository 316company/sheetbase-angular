import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

export interface IAppFile {
  name: string,
  size: number,
  mimeType: string,
  base64: string
}

@Injectable()
export class FileService {

  constructor(
    private ngZone: NgZone,

    private apiService: ApiService
  ) {
  }

  get(fileId: string): Promise<any> {
    return this.apiService.GET('/file', {
      id: fileId
    });
  }


  // TODO: https://xkeshi.github.io/image-compressor/
  upload(appFile: IAppFile, customFolder: string = null): Observable<any> {
    return new Observable(observer => {
      let body: any = {
        file: Object.assign(this.base64Breakdown(appFile.base64), {
          name: appFile.name
        })
      }
      if(customFolder) body.folder = customFolder;
      this.apiService.POST('/file', {}, body)
      .then(response => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  load(file: File): Promise<IAppFile> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        resolve({
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
