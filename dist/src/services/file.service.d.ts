import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api.service';
import { IAppFile, IAppHTTPResponse } from '../misc/interfaces';
export declare class FileService {
    private ngZone;
    private apiService;
    constructor(ngZone: NgZone, apiService: ApiService);
    get(fileId: string): Observable<IAppHTTPResponse>;
    upload(appFile: IAppFile, customFolder?: string, customName?: string): Observable<IAppHTTPResponse>;
    load(file: File): Observable<IAppFile>;
    private base64Breakdown(base64Data);
}
