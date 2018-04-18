import { Injectable, Inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events } from 'ionic-angular';
import { Observable } from 'rxjs';

import { SheetbaseConfigService } from './sheetbase-config.service';

import { IDataQuery, ITable } from '../misc/interfaces';
import { HELPER } from '../misc/helper';


@Injectable()
export class SheetbaseService {

  private tables: ITable[];
  private database: {
    [collection: string]: any
  };
  private onTheFlyTracker: string[];

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
    private events: Events,

    @Inject(SheetbaseConfigService) private CONFIG
  ) {
    this.tables = [{name: 'categories'},{name: 'tags'},{name: 'authors'},{name: 'posts'},{name: 'pages'}]; // default tables
  }

  db() {
    return {
      id: this.CONFIG.database,
      tables: this.tables || []
    };
  }

  init(): any {
    this.spreadsheetGet({
      id: this.CONFIG.database,
      range: '__tables__!A1:C'
    }, null, 'name', false)
    .then(tables => {
      this.tables = tables;
      this.events.publish('appData:tables', tables);
      this.loadData(); // auto-load
    })
    .catch(error => { this.init() }); // retry
  }

  get(
    collection: string,
    doc: string = null,
    query: IDataQuery = null,
    oneTime: boolean = false
  ): Observable<any> {
    return new Observable(observer => {      
      this.database = this.database || {};
      let itemsObject = this.database[collection] || {};
      
      if(!itemsObject || Object.keys(itemsObject).length < 1) this.initNonAutoloadTable(collection);

      // return current whatever data
      if(doc) {
        observer.next(Object.assign({
          $key: doc
        }, itemsObject[doc] || {}));
        
        // event
        if(oneTime) {
          observer.complete();
        } else {
          // listen for change
          this.events.subscribe('appData:'+ collection, eventData => {
            observer.next(Object.assign({
              $key: doc
            }, eventData[doc] || {}));
          });
        }
      } else {
        let itemsArray = [];
        for(let key in itemsObject) {
          itemsArray.push(Object.assign({
            $key: key
          }, itemsObject[key]));
        }        

        observer.next(
          this.filterResult(itemsArray, query)
        );

        // event
        if(oneTime) {
          observer.complete();
        } else {
          // listen for change
          this.events.subscribe('appData:'+ collection, eventData => {
            delete eventData.$key;
            observer.next(
              this.filterResult(
                HELPER.o2a(eventData, true), query
              )
            );
          });
        }
      }
      
    });
  }



  api(method: string = 'GET', endpoint: string = null, params: any = {}, body: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!this.CONFIG.backend) reject({
        message: 'No backend!'
      });

      // build uri
      let uri: string = 'https://script.google.com/macros/s/'+ this.CONFIG.backend +'/exec';
      if(endpoint) uri += '?e='+ endpoint;
      if(!endpoint && Object.keys(params||{}).length > 0) uri += '?';
      for(let key in (params||{})) {
        uri += '&'+ key +'='+ params[key];
      }
      if(!endpoint && Object.keys(params||{}).length > 0) uri = uri.replace('?&', '?');

      // get data
      if(method.toLowerCase() === 'post') {
        body = Object.assign({}, body, {
          apiKey: this.CONFIG.apiKey
        });
        this.http.post<any>(uri, JSON.stringify(body), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).subscribe(data => {
          if(data.error) reject(data);
          resolve(data);
        }, reject);
      } else {
        if(!endpoint && Object.keys(params).length < 1) {
          uri += '?apiKey='+ this.CONFIG.apiKey;
        } else {
          uri += '&apiKey='+ this.CONFIG.apiKey;
        }
        this.http.get<any>(uri).subscribe(data => {
          if(data.error) reject(data);
          resolve(data);        
        }, reject);
      }
    });
  }







  private initNonAutoloadTable(tableName: string) {
    if(!this.tables) {
      this.events.subscribe('appData:tables', eventData => {
        this.loadNonAutoloadTable(tableName);
      });
    } else {
      this.loadNonAutoloadTable(tableName);
    }
  }
  
  private loadNonAutoloadTable(tableName: string) {
    let thisTable = null;
    (this.tables || []).forEach(table => {
      if(table.name === tableName) thisTable = table;
    });
    if(thisTable) return this.loadData([thisTable]);
  }

  private loadData(tables: ITable[] = null): void {

    // get data
    (tables || this.tables || []).forEach(table => {
      if(!tables && !table.autoload) return;
      if((this.onTheFlyTracker||[]).indexOf(table.name) > -1) return;

      // console.info('GO FLY -> '+ table.name +'[]');

      // record data on the fly to avoid unneccesary actions
      this.onTheFlyTracker = this.onTheFlyTracker || [];
      this.onTheFlyTracker.push(table.name);

      // go fly
      setTimeout(() => {
        this.spreadsheetGet({
          id: this.CONFIG.database,
          range: table.name +'!'+ (table.range || 'A1:ZZ')
        }, table.name, table.key)
        .then(data => {
          this.database = this.database || {}; 
          this.database[table.name] = data;

          // notify the event
          this.events.publish('appData:'+ table.name, data);

          // remove data on the fly recorder
          this.onTheFlyTracker.splice(this.onTheFlyTracker.indexOf('table.name'), 1);
        }).catch(error => { return });
      }, 100);

    });

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















  /*
  * SPREAHSHEET
  * */
  spreadsheetGet(
    sheet: {id: string, range: string},
    dataType: string = null,
    keyField: string = null,
    returnObject: boolean = true
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if(sheet.range.indexOf(',') < 0) {
        this.spreadsheetLoad(sheet.id, sheet.range)
        .then(value => this.ngZone.run(() => {          
          resolve(this.spreadsheetModifyValue(value, dataType, keyField, returnObject));
        }))
        .catch(reject);
      } else {
        let rangeStr = '';
        ((sheet.range.split(',')).map(x => {return x.trim()})||[]).forEach(range => {
          rangeStr += '&ranges='+ range;
        });
        this.spreadsheetLoadBatch(sheet.id, rangeStr)
        .then(value => this.ngZone.run(() => {
          resolve(this.spreadsheetModifyValue(value, dataType, keyField, returnObject));
        }))
        .catch(reject);
      }
    });
  }

  private spreadsheetLoad(id: string, range: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<{values: any}>
      (`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?key=${this.CONFIG.apiKey}`)
      .subscribe(response => {
        resolve(this.spreadsheetTransformValue(response.values));        
      }, reject);
    });
  }

  private spreadsheetTransformValue(value) {
    let items = [],
      headers = value[0] || [];

    (value.slice(1, value.length) || []).forEach(rows => {
      let item: any = {};
      for (let i = 0; i < rows.length; i++) {
        if(rows[i]) {
          let val: any = rows[i];
          item[headers[i]] = val;
        }
      }
      items.push(item);
    });

    return items;
  }

  private spreadsheetLoadBatch(id: string, ranges: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<{valueRanges: any}>
      (`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchGet?${ranges}&key=${this.CONFIG.apiKey}`)
      .subscribe(response => {
        resolve(this.spreadsheetTransformBatchValue(response.valueRanges));        
      }, reject);
    });
  }

  private spreadsheetTransformBatchValue(value) {
    // round 1
    let base = this.spreadsheetTransformValue(value[0].values || []);
    let more = [];
    (value.slice(1, value.length) || []).forEach(item => {
      more.push(this.spreadsheetTransformValue(item.values || []));
    });

    // round 2
    let final = [];
    (base || []).forEach(baseItem => {
      (more || []).forEach(moreList => {
        (moreList || []).forEach(moreItem => {
          if(baseItem.key === moreItem.key) {
            baseItem = Object.assign(baseItem, moreItem);
          }
        });
      });
      final.push(baseItem);
    });

    return final;
  }

  private spreadsheetModifyValue(
    value: any,
    dataType: string,
    keyField: string,
    returnObject: boolean
  ): any {
    let customModifier = (item, tools: any = {}) => { return item };
    if(dataType && this.CONFIG.modifiers && this.CONFIG.modifiers[dataType]) customModifier = this.CONFIG.modifiers[dataType]; 

    let itemsObject = null;
    let itemsArray = null;
    (value||[]).forEach(item => {
      
      // basic modifier
      for(let key in item) {
        //transform JSON where possible
        try {
          item[key] = JSON.parse(item[key]);
        } catch(e) {}

        // transform number
        if(!isNaN(item[key]) && Number(item[key]) % 1 === 0) item[key] = parseInt(item[key]);
        if(!isNaN(item[key]) && Number(item[key]) % 1 !== 0) item[key] = parseFloat(item[key]);

        // transform boolean value
        if(typeof item[key] === 'string' || item[key] instanceof String) item[key] = ((item[key]).toLowerCase() === 'true') || ((item[key]).toLowerCase() === 'false' ? false : item[key]);

        // delete null key
        if(item[key] === '' || item[key] === null || item[key] === undefined) {
          delete item[key];
        }
      }

      // custom modifier
      item = customModifier(item, {/* tools to help modify data */});

      // transform array to object
      itemsObject = itemsObject || {};
      itemsObject[keyField ? item[keyField]: (item.key || item.slug || (''+ item.id))] = item;
      itemsArray = itemsArray || [];
      itemsArray.push(item);
    });
    
    return returnObject ? itemsObject: itemsArray;
  }

}
