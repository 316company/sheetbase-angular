import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
export declare class FileService {
    private ngZone;
    private apiService;
    constructor(ngZone: NgZone, apiService: ApiService);
    get(fileId: string): Promise<any>;
    upload(file: File, customFolder?: string): Observable<any>;
    private base64Breakdown(base64Data);
}
