import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SheetbaseConfigService } from './sheetbase-config.service';
import { ApiService } from './api.service';
import { SpreadsheetService } from './spreadsheet.service';

import { IDataQuery, ISheetbaseConfig } from '../misc/interfaces';
import { HELPER } from '../misc/helper';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private database: {
    [collection: string]: any
  };

  constructor(
    @Inject(SheetbaseConfigService) private CONFIG: ISheetbaseConfig,
    private apiService: ApiService,
    private spreadsheetService: SpreadsheetService,
  ) {
  }


  /**
   * Get data
   * @param collection 
   * @param doc 
   * @param query 
   */
  get(
    collection: string,
    doc: string = null,
    query: IDataQuery = null
  ): Observable<any> {
    return new Observable(observer => {

      let itemsObject = (this.database||{})[collection];
      
      // return data if available
      if(itemsObject && Object.keys(itemsObject).length > 0) {
        observer.next(this.returnData(collection, doc, query));
        observer.complete();
      } else {
        // get new data
        let dataGetter: Observable<any> = this.getData(collection, doc, query);
        if(this.CONFIG.googleApiKey && this.CONFIG.databaseId) {
          dataGetter = this.getDataSolutionLite(collection, doc, query);
        }
        
        dataGetter.subscribe(result => {
          if(!this.database) this.database = {};
          this.database[collection] = result;
  
          observer.next(this.returnData(collection, doc, query));
          observer.complete();
        }, error => observer.error(error));
      }      

    });
  }

  private getData(
    collection: string,
    doc: string,
    query: IDataQuery
  ): Observable<any> {
    return new Observable(observer => {
      this.apiService.GET('/data', {
        table: collection
      }).subscribe(response => {
        observer.next(
          this.modifyValue(response.data, collection)
        );
      }, error => observer.error(error));
    });
  }

  private getDataSolutionLite(
    collection: string,
    doc: string,
    query: IDataQuery
  ): Observable<any> {
    return new Observable(observer => {
      this.spreadsheetService.get(
        collection
      )
      .subscribe(result => {
        observer.next(result);
      }, error => observer.error(error));
    });
  }


  /**
   * 
   * @param collection 
   * @param doc 
   * @param query 
   */
  private returnData(collection, doc, query) {
    let itemsObject = (this.database||{})[collection] || {};
    // item
    if(doc) {
      return Object.assign({
        $key: doc
      }, itemsObject[doc] || {})
    }
    // list
    let itemsArray = [];
    for(let key in itemsObject) {
      itemsArray.push(Object.assign({
        $key: key
      }, itemsObject[key]));
    }
    return this.filterResult(itemsArray, query);
  }

  private filterResult(items: any[], query: IDataQuery) {
    query = query || {};
    let resultItems = [];

    // filter
    if(
      query.orderByKey &&
      (query.equalTo || (!query.equalTo && typeof query.equalTo === 'boolean'))
    ) {
      let keys = (query.orderByKey).split('/');
      let keyFirst = keys[0];
      keys = keys.slice(1, keys.length);

      (items||[]).forEach(item => {
        let value = item[keyFirst] || {};
        // console.log(''+ item.title +' ', value, keys);

        (keys||[]).forEach(key => {
          if(value[key]) {
            value = value[key];
          } else {
            return value = null;
          }
        });

        // console.log('final value ', value);
        if(
          (typeof query.equalTo === 'boolean' && typeof value === 'boolean' && value === query.equalTo) || // true === true
          (query.equalTo === '!null' && !!value) || // any (#false) === '!null'
          (typeof query.equalTo !== 'boolean' && typeof value !== 'boolean' && value === query.equalTo) // string, number === string, number
        ) resultItems.push(item);
      });
    } else {
      resultItems = items;
    }

    // sort result
    resultItems = HELPER.sort(resultItems, (query.orderByKey||'id'), (query.order||'asc'));
    
    // limit
    if(query.limitToFirst) resultItems = resultItems.slice(
      query.offset || 0,
      query.limitToFirst + (query.offset || 0)
    );
    if(query.limitToLast) resultItems = resultItems.slice(
      resultItems.length - query.limitToLast - (query.offset || 0),
      (resultItems.length - (query.offset || 0))
    );

    return resultItems;
  }

  private modifyValue(
    value: any,
    table: string
  ): any {
    let customModifier = (item, tools: any = {}) => { return item };
    if(table && this.CONFIG.modifiers && this.CONFIG.modifiers[table]) customModifier = this.CONFIG.modifiers[table]; 

    let itemsObject = {};
    for(let key in value) {
      let item = value[key];
      item = customModifier(item, {/* tools to help modify data */});
      itemsObject[key] = item;
    }
    
    return itemsObject;
  }


}
