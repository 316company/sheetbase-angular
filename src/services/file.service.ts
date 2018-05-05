import { Injectable, NgZone } from '@angular/core';

import { ApiService } from './api.service';

import { IAppFile } from '../misc/interfaces';

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
  upload(appFile: IAppFile, customFolder: string = null, customName: string = null): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!appFile) return reject('No local file!');
      let body: any = {
        file: Object.assign(this.base64Breakdown(appFile.base64), {
          name: appFile.name
        })
      }
      if(customFolder) body.folder = customFolder;
      if(customName) body.name = customName;
      this.apiService.POST('/file', {}, body)
      .then(resolve)
      .catch(reject);
    });
  }

  load(file: File): Promise<IAppFile> {
    return new Promise((resolve, reject) => {
      if(!file) resolve(null);
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
