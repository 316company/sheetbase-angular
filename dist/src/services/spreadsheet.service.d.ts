import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
export declare class SpreadsheetService {
    private ngZone;
    private http;
    private CONFIG;
    constructor(ngZone: NgZone, http: HttpClient, CONFIG: any);
    get(tableName: string, range?: string, keyField?: string, returnObject?: boolean): Observable<any>;
    getData(spreadsheetId: string, rangeA1: string, type: string, keyField: string, returnObject: boolean): Observable<any>;
    private load;
    private transformValue;
    private loadBatch;
    private transformBatchValue;
    private modifyValue;
}
