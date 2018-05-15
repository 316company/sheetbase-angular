import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api.service';
import { SpreadsheetService } from './spreadsheet.service';
import { IDataQuery, ISheetbaseConfig } from '../misc/interfaces';
export declare class DataService {
    private ngZone;
    private CONFIG;
    private apiService;
    private spreadsheetService;
    private database;
    constructor(ngZone: NgZone, CONFIG: ISheetbaseConfig, apiService: ApiService, spreadsheetService: SpreadsheetService);
    /**
     * Get data
     * @param collection
     * @param doc
     * @param query
     */
    get(collection: string, doc?: string, query?: IDataQuery): Observable<any>;
    private getData(collection, doc, query);
    private getDataSolutionLite(collection, doc, query);
    /**
     *
     * @param collection
     * @param doc
     * @param query
     */
    private returnData(collection, doc, query);
    private filterResult(items, query);
    private modifyValue(value, table);
}
