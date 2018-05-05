import { HttpClient } from '@angular/common/http';
import { UserDataService } from './user-data.service';
import { IAppHTTPResponse } from '../misc/interfaces';
export declare class ApiService {
    private http;
    private CONFIG;
    private userDataService;
    constructor(http: HttpClient, CONFIG: any, userDataService: UserDataService);
    /**
     * GET
     * @param endpoint
     * @param params
     */
    GET(endpoint?: string, params?: any): Promise<IAppHTTPResponse>;
    /**
     * POST
     * @param endpoint
     * @param params
     * @param body
     */
    POST(endpoint?: string, params?: any, body?: any): Promise<IAppHTTPResponse>;
}
