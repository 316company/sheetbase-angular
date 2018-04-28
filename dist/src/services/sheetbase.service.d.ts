import { NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDataQuery } from '../misc/interfaces';
export declare class SheetbaseService {
    private ngZone;
    private http;
    private CONFIG;
    private database;
    constructor(ngZone: NgZone, http: HttpClient, CONFIG: any);
    /**
     * Get data
     * @param collection
     * @param doc
     * @param query
     */
    get(collection: string, doc?: string, query?: IDataQuery): Observable<any>;
    /**
     *
     * @param collection
     * @param doc
     * @param query
     */
    private returnData(collection, doc, query);
    private filterResult(items, query);
    private spreadsheetGet(sheet, dataType?, keyField?, returnObject?);
    private spreadsheetLoad(id, range);
    private spreadsheetTransformValue(value);
    private spreadsheetLoadBatch(id, ranges);
    private spreadsheetTransformBatchValue(value);
    private spreadsheetModifyValue(value, dataType, keyField, returnObject);
}
