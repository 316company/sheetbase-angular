import { NgZone } from '@angular/core';
import { ApiService } from './api.service';
import { IAppFile } from '../misc/interfaces';
export declare class FileService {
    private ngZone;
    private apiService;
    constructor(ngZone: NgZone, apiService: ApiService);
    get(fileId: string): Promise<any>;
    upload(appFile: IAppFile, customFolder?: string, customName?: string): Promise<any>;
    load(file: File): Promise<IAppFile>;
    private base64Breakdown(base64Data);
}
