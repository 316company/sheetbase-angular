import { Injectable, Inject, NgZone } from '@angular/core';
import { SheetbaseConfigService } from './sheetbase-config.service';
import { ApiService } from './api.service';
import { HELPER } from '../misc/helper';
var DataService = /** @class */ (function () {
    function DataService(ngZone, CONFIG, apiService) {
        this.ngZone = ngZone;
        this.CONFIG = CONFIG;
        this.apiService = apiService;
    }
    /**
     * Get data
     * @param collection
     * @param doc
     * @param query
     */
    /**
       * Get data
       * @param collection
       * @param doc
       * @param query
       */
    DataService.prototype.get = /**
       * Get data
       * @param collection
       * @param doc
       * @param query
       */
    function (collection, doc, query) {
        var _this = this;
        if (doc === void 0) { doc = null; }
        if (query === void 0) { query = null; }
        return new Promise(function (resolve, reject) {
            var itemsObject = (_this.database || {})[collection];
            // return data
            // return data
            if (itemsObject && Object.keys(itemsObject).length > 0) {
                resolve(_this.returnData(collection, doc, query));
            }
            _this.apiService.GET('/data', {
                table: collection
            }).then(function (response) {
                _this.ngZone.run(function () {
                    if (!_this.database)
                        _this.database = {};
                    _this.database[collection] = _this.modifyValue(response.data, collection);
                });
                resolve(_this.returnData(collection, doc, query));
            }).catch(reject);
        });
    };
    /**
     *
     * @param collection
     * @param doc
     * @param query
     */
    /**
       *
       * @param collection
       * @param doc
       * @param query
       */
    DataService.prototype.returnData = /**
       *
       * @param collection
       * @param doc
       * @param query
       */
    function (collection, doc, query) {
        var itemsObject = (this.database || {})[collection] || {};
        // item
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
        // filter
        if (query.orderByKey &&
            (query.equalTo || (!query.equalTo && typeof query.equalTo === 'boolean'))) {
            var keys_1 = (query.orderByKey).split('/');
            var keyFirst_1 = keys_1[0];
            keys_1 = keys_1.slice(1, keys_1.length);
            (items || []).forEach(function (item) {
                var value = item[keyFirst_1] || {};
                // console.log(''+ item.title +' ', value, keys);
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
                // console.log('final value ', value);
                if ((typeof query.equalTo === 'boolean' && typeof value === 'boolean' && value === query.equalTo) || // true === true
                    // true === true
                    (query.equalTo === '!null' && !!value) || // any (#false) === '!null'
                    // any (#false) === '!null'
                    (typeof query.equalTo !== 'boolean' && typeof value !== 'boolean' && value === query.equalTo) // string, number === string, number
                // string, number === string, number
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
            item = customModifier(item, {});
            itemsObject[key] = item;
        }
        return itemsObject;
    };
    DataService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    DataService.ctorParameters = function () { return [
        { type: NgZone, },
        { type: undefined, decorators: [{ type: Inject, args: [SheetbaseConfigService,] },] },
        { type: ApiService, },
    ]; };
    return DataService;
}());
export { DataService };
//# sourceMappingURL=data.service.js.map