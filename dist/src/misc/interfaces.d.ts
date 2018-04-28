export interface IConfig {
    apiKey: string;
    database: string;
    backend?: string;
    cache?: number;
    modifiers?: any;
}
export interface IDataQuery {
    limitToFirst?: number;
    limitToLast?: number;
    offset?: number;
    orderByKey?: string;
    equalTo?: any;
    order?: string;
}
