export interface IConfig {
    database: string;
    apiKey: string;
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
export interface ITable {
    name: string;
    range?: string;
    autoload?: boolean;
    key?: string;
}
