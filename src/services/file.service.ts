import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

@Injectable()
export class FileService {

  constructor(
    private ngZone: NgZone,

    private apiService: ApiService
  ) {
  }

  get(fileId: string) {
    return this.apiService.GET('/file', {
      id: fileId
    });
  }


  // TODO: https://xkeshi.github.io/image-compressor/
  upload(file: File, customFolder: string = null): Observable<any> {
    return new Observable(observer => {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        let body: any = {
          file: Object.assign(this.base64Breakdown(e.target.result), {
            name: file.name
          })
        }
        if(customFolder) body.folder = customFolder;
        this.apiService.POST('/file', {}, body)
        .then(response => {
          observer.next(response);
          observer.complete();
        });
      }
      reader.readAsDataURL(file);
    });
  }

  private base64Breakdown(base64Data) {
    var breakdownData = base64Data.split(';base64,');
    return {
      mimeType: breakdownData[0].replace('data:', ''),
      base64String: breakdownData[1]
    };
  }



}
