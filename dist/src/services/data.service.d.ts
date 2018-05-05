import { NgZone } from '@angular/core';
import { ApiService } from './api.service';
import { IDataQuery } from '../misc/interfaces';
export declare class DataService {
    private ngZone;
    private CONFIG;
    private apiService;
    private database;
    constructor(ngZone: NgZone, CONFIG: any, apiService: ApiService);
    /**
     * Get data
     * @param collection
     * @param doc
     * @param query
     */
    get(collection: string, doc?: string, query?: IDataQuery): Promise<any>;
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
