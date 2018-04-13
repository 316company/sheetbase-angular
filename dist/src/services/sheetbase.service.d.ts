import { NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events } from 'ionic-angular';
import { Observable } from 'rxjs';
import { IDataQuery, ITable } from '../misc/interfaces';
export declare class SheetbaseService {
    private ngZone;
    private http;
    private events;
    private CONFIG;
    private tables;
    private database;
    private onTheFlyTracker;
    constructor(ngZone: NgZone, http: HttpClient, events: Events, CONFIG: any);
    db(): {
        id: any;
        tables: ITable[];
    };
    init(): any;
    get(collection: string, doc?: string, query?: IDataQuery, oneTime?: boolean): Observable<any>;
    private loadData(tables?);
    private filterResult(items, query);
    spreadsheetGet(sheet: {
        id: string;
        range: string;
    }, dataType?: string, keyField?: string, returnObject?: boolean): Promise<any>;
    private spreadsheetLoad(id, range);
    private spreadsheetTransformValue(value);
    private spreadsheetLoadBatch(id, ranges);
    private spreadsheetTransformBatchValue(value);
    private spreadsheetModifyValue(value, dataType, keyField, returnObject);
}
