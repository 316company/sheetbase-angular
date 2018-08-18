import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SheetbaseConfigService } from './sheetbase-config.service';
import { ApiService } from './api.service';
import { SpreadsheetService } from './spreadsheet.service';
import { HELPER } from '../misc/helper';
import * as i0 from "@angular/core";
import * as i1 from "./sheetbase-config.service";
import * as i2 from "./api.service";
import * as i3 from "./spreadsheet.service";
var DataService = /** @class */ (function () {
    function DataService(CONFIG, apiService, spreadsheetService) {
        this.CONFIG = CONFIG;
        this.apiService = apiService;
        this.spreadsheetService = spreadsheetService;
    }
    /**
     * Get data
     * @param collection
     * @param doc
     * @param query
     */
    DataService.prototype.get = function (collection, doc, query) {
        var _this = this;
        if (doc === void 0) { doc = null; }
        if (query === void 0) { query = null; }
        return new Observable(function (observer) {
            var itemsObject = (_this.database || {})[collection];
            // return data if available
            if (itemsObject && Object.keys(itemsObject).length > 0) {
                observer.next(_this.returnData(collection, doc, query));
                observer.complete();
            }
            else {
                // get new data
                var dataGetter = _this.getData(collection, doc, query);
                if (_this.CONFIG.googleApiKey && _this.CONFIG.databaseId) {
                    dataGetter = _this.getDataSolutionLite(collection, doc, query);
                }
                dataGetter.subscribe(function (result) {
                    if (!_this.database)
                        _this.database = {};
                    _this.database[collection] = result;
                    observer.next(_this.returnData(collection, doc, query));
                    observer.complete();
                }, function (error) { return observer.error(error); });
            }
        });
    };
    DataService.prototype.getData = function (collection, doc, query) {
        var _this = this;
        return new Observable(function (observer) {
            _this.apiService.GET('/data', {
                table: collection
            }).subscribe(function (response) {
                observer.next(_this.modifyValue(response.data, collection));
            }, function (error) { return observer.error(error); });
        });
    };
    DataService.prototype.getDataSolutionLite = function (collection, doc, query) {
        var _this = this;
        return new Observable(function (observer) {
            _this.spreadsheetService.get(collection)
                .subscribe(function (result) {
                observer.next(result);
            }, function (error) { return observer.error(error); });
        });
    };
    /**
     *
     * @param collection
     * @param doc
     * @param query
     */
    DataService.prototype.returnData = function (collection, doc, query) {
        var itemsObject = (this.database || {})[collection] || {};
        // item
        if (doc) {
            return Object.assign({
                $key: doc
            }, itemsObject[doc] || {});
        }
        // list
        var itemsArray = [];
        for (var key in itemsObject) {
            itemsArray.push(Object.assign({
                $key: key
            }, itemsObject[key]));
        }
        return this.filterResult(itemsArray, query);
    };
    DataService.prototype.filterResult = function (items, query) {
        query = query || {};
        var resultItems = [];
        // filter
        if (query.orderByKey &&
            (query.equalTo || (!query.equalTo && typeof query.equalTo === 'boolean'))) {
            var keys_1 = (query.orderByKey).split('/');
            var keyFirst_1 = keys_1[0];
            keys_1 = keys_1.slice(1, keys_1.length);
            (items || []).forEach(function (item) {
                var value = item[keyFirst_1] || {};
                // console.log(''+ item.title +' ', value, keys);
                (keys_1 || []).forEach(function (key) {
                    if (value[key]) {
                        value = value[key];
                    }
                    else {
                        return value = null;
                    }
                });
                // console.log('final value ', value);
                if ((typeof query.equalTo === 'boolean' && typeof value === 'boolean' && value === query.equalTo) || // true === true
                    (query.equalTo === '!null' && !!value) || // any (#false) === '!null'
                    (typeof query.equalTo !== 'boolean' && typeof value !== 'boolean' && value === query.equalTo) // string, number === string, number
                )
                    resultItems.push(item);
            });
        }
        else {
            resultItems = items;
        }
        // sort result
        resultItems = HELPER.sort(resultItems, (query.orderByKey || 'id'), (query.order || 'asc'));
        // limit
        if (query.limitToFirst)
            resultItems = resultItems.slice(query.offset || 0, query.limitToFirst + (query.offset || 0));
        if (query.limitToLast)
            resultItems = resultItems.slice(resultItems.length - query.limitToLast - (query.offset || 0), (resultItems.length - (query.offset || 0)));
        return resultItems;
    };
    DataService.prototype.modifyValue = function (value, table) {
        var customModifier = function (item, tools) {
            if (tools === void 0) { tools = {}; }
            return item;
        };
        if (table && this.CONFIG.modifiers && this.CONFIG.modifiers[table])
            customModifier = this.CONFIG.modifiers[table];
        var itemsObject = {};
        for (var key in value) {
            var item = value[key];
            item = customModifier(item, { /* tools to help modify data */});
            itemsObject[key] = item;
        }
        return itemsObject;
    };
    DataService.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] },
    ];
    /** @nocollapse */
    DataService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [SheetbaseConfigService,] }] },
        { type: ApiService },
        { type: SpreadsheetService }
    ]; };
    DataService.ngInjectableDef = i0.defineInjectable({ factory: function DataService_Factory() { return new DataService(i0.inject(i1.SheetbaseConfigService), i0.inject(i2.ApiService), i0.inject(i3.SpreadsheetService)); }, token: DataService, providedIn: "root" });
    return DataService;
}());
export { DataService };
//# sourceMappingURL=data.service.js.map