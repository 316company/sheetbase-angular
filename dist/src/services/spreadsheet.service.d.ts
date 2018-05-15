import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
export declare class SpreadsheetService {
    private ngZone;
    private http;
    private CONFIG;
    constructor(ngZone: NgZone, http: HttpClient, CONFIG: any);
    get(tableName: string, range?: string, keyField?: string, returnObject?: boolean): Observable<any>;
    getData(spreadsheetId: string, rangeA1: string, type: string, keyField: string, returnObject: boolean): Observable<any>;
    private load(id, range);
    private transformValue(value);
    private loadBatch(id, ranges);
    private transformBatchValue(value);
    private modifyValue(value, tableName, keyField, returnObject);
}
