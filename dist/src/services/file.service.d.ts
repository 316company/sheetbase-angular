import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
export interface IAppFile {
    name: string;
    size: number;
    mimeType: string;
    base64: string;
}
export declare class FileService {
    private ngZone;
    private apiService;
    constructor(ngZone: NgZone, apiService: ApiService);
    get(fileId: string): Promise<any>;
    upload(appFile: IAppFile, customFolder?: string): Observable<any>;
    load(file: File): Promise<IAppFile>;
    private base64Breakdown(base64Data);
}
