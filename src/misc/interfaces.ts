export interface ISheetbaseConfig {
    apiKey?: string,
    backendUrl?: string,
    cache?: number,

    googleApiKey?: string,
    databaseId?: string,
    modifiers?: any
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

export interface IAppFile {
    name?: string,
    size?: number,
    mimeType?: string,
    base64?: string
  }