import { NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export declare class SpreadsheetService {
    private ngZone;
    private http;
    private CONFIG;
    constructor(ngZone: NgZone, http: HttpClient, CONFIG: any);
    get(spreadsheetId: string, rangeA1: string, dataType?: string, keyField?: string, returnObject?: boolean): Promise<any>;
    private load(id, range);
    private transformValue(value);
    private loadBatch(id, ranges);
    private transformBatchValue(value);
    private modifyValue(value, dataType, keyField, returnObject);
}
