export interface ISheetbaseConfig {
    apiKey: string,
    backend: string,
    cache?: number
}
export interface ISheetbaseConfigLite {
    googleApiKey: string,
    database: string
}

export interface IDataQuery {
    limitToFirst?: number
    limitToLast?: number,
    offset?: number,

    orderByKey?: string,
    equalTo?: any,
    order?: string
}

export interface IAppHTTPResponse {
    status?: number,
    error?: boolean,
    success?: boolean,
    meta?: any,
    data?: any
}