import { Injectable, Inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SheetbaseConfigService } from './sheetbase-config.service';
import { HELPER } from '../misc/helper';
var SheetbaseService = /** @class */ (function () {
    function SheetbaseService(ngZone, http, CONFIG) {
        this.ngZone = ngZone;
        this.http = http;
        this.CONFIG = CONFIG;
    }
    SheetbaseService.prototype.get = function (collection, doc, query) {
        var _this = this;
        if (doc === void 0) { doc = null; }
        if (query === void 0) { query = null; }
        return new Observable(function (observer) {
            var itemsObject = (_this.database || {})[collection] || {};
            if (!itemsObject || Object.keys(itemsObject).length < 1) {
                _this.spreadsheetGet({
                    id: _this.CONFIG.database,
                    range: collection + '!A1:ZZ'
                }, collection)
                    .then(function (data) {
                    _this.database = _this.database || {};
                    _this.database[collection] = data;
                    observer.next(_this.returnData(collection, doc, query));
                    observer.complete();
                }).catch(function (error) {
                    return Observable.throw(error);
                });
            }
            else {
                observer.next(_this.returnData(collection, doc, query));
                observer.complete();
            }
        });
    };
    SheetbaseService.prototype.api = function (method, endpoint, params, body) {
        var _this = this;
        if (method === void 0) { method = 'GET'; }
        if (endpoint === void 0) { endpoint = null; }
        if (params === void 0) { params = {}; }
        if (body === void 0) { body = {}; }
        return new Promise(function (resolve, reject) {
            if (!_this.CONFIG.backend)
                reject({
                    message: 'No backend found in the config file!'
                });
            // build uri
            var uri = 'https://script.google.com/macros/s/' + _this.CONFIG.backend + '/exec';
            if (endpoint)
                uri += '?e=' + endpoint;
            if (!endpoint && Object.keys(params || {}).length > 0)
                uri += '?';
            for (var key in (params || {})) {
                uri += '&' + key + '=' + params[key];
            }
            if (!endpoint && Object.keys(params || {}).length > 0)
                uri = uri.replace('?&', '?');
            // get data
            // get data
            if (method.toLowerCase() === 'post') {
                body = Object.assign({}, body, {
                    apiKey: _this.CONFIG.apiKey
                });
                _this.http.post(uri, JSON.stringify(body), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).subscribe(function (data) {
                    if (data.error)
                        reject(data);
                    resolve(data);
                }, reject);
            }
            else {
                if (!endpoint && Object.keys(params).length < 1) {
                    uri += '?apiKey=' + _this.CONFIG.apiKey;
                }
                else {
                    uri += '&apiKey=' + _this.CONFIG.apiKey;
                }
                _this.http.get(uri).subscribe(function (data) {
                    if (data.error)
                        reject(data);
                    resolve(data);
                }, reject);
            }
        });
    };
    SheetbaseService.prototype.returnData = function (collection, doc, query) {
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
    SheetbaseService.prototype.filterResult = function (items, query) {
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
    /*
    * SPREAHSHEET
    * */
    /*
      * SPREAHSHEET
      * */
    SheetbaseService.prototype.spreadsheetGet = /*
      * SPREAHSHEET
      * */
    function (sheet, dataType, keyField, returnObject) {
        var _this = this;
        if (dataType === void 0) { dataType = null; }
        if (keyField === void 0) { keyField = null; }
        if (returnObject === void 0) { returnObject = true; }
        return new Promise(function (resolve, reject) {
            if (sheet.range.indexOf(',') < 0) {
                _this.spreadsheetLoad(sheet.id, sheet.range)
                    .then(function (value) {
                    return _this.ngZone.run(function () {
                        resolve(_this.spreadsheetModifyValue(value, dataType, keyField, returnObject));
                    });
                })
                    .catch(reject);
            }
            else {
                var rangeStr_1 = '';
                ((sheet.range.split(',')).map(function (x) { return x.trim(); }) || []).forEach(function (range) {
                    rangeStr_1 += '&ranges=' + range;
                });
                _this.spreadsheetLoadBatch(sheet.id, rangeStr_1)
                    .then(function (value) {
                    return _this.ngZone.run(function () {
                        resolve(_this.spreadsheetModifyValue(value, dataType, keyField, returnObject));
                    });
                })
                    .catch(reject);
            }
        });
    };
    SheetbaseService.prototype.spreadsheetLoad = function (id, range) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.http.get("https://sheets.googleapis.com/v4/spreadsheets/" + id + "/values/" + range + "?key=" + _this.CONFIG.apiKey)
                .subscribe(function (response) {
                resolve(_this.spreadsheetTransformValue(response.values));
            }, reject);
        });
    };
    SheetbaseService.prototype.spreadsheetTransformValue = function (value) {
        var items = [], headers = value[0] || [];
        (value.slice(1, value.length) || []).forEach(function (rows) {
            var item = {};
            for (var i = 0; i < rows.length; i++) {
                if (rows[i]) {
                    var val = rows[i];
                    item[headers[i]] = val;
                }
            }
            items.push(item);
        });
        return items;
    };
    SheetbaseService.prototype.spreadsheetLoadBatch = function (id, ranges) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.http.get("https://sheets.googleapis.com/v4/spreadsheets/" + id + "/values:batchGet?" + ranges + "&key=" + _this.CONFIG.apiKey)
                .subscribe(function (response) {
                resolve(_this.spreadsheetTransformBatchValue(response.valueRanges));
            }, reject);
        });
    };
    SheetbaseService.prototype.spreadsheetTransformBatchValue = function (value) {
        var _this = this;
        // round 1
        var base = this.spreadsheetTransformValue(value[0].values || []);
        var more = [];
        (value.slice(1, value.length) || []).forEach(function (item) {
            more.push(_this.spreadsheetTransformValue(item.values || []));
        });
        // round 2
        var final = [];
        (base || []).forEach(function (baseItem) {
            (more || []).forEach(function (moreList) {
                (moreList || []).forEach(function (moreItem) {
                    if (baseItem.key === moreItem.key) {
                        baseItem = Object.assign(baseItem, moreItem);
                    }
                });
            });
            final.push(baseItem);
        });
        return final;
    };
    SheetbaseService.prototype.spreadsheetModifyValue = function (value, dataType, keyField, returnObject) {
        var customModifier = function (item, tools) {
            if (tools === void 0) { tools = {}; }
            return item;
        };
        if (dataType && this.CONFIG.modifiers && this.CONFIG.modifiers[dataType])
            customModifier = this.CONFIG.modifiers[dataType];
        var itemsObject = null;
        var itemsArray = null;
        (value || []).forEach(function (item) {
            // basic modifier
            // basic modifier
            for (var key in item) {
                //transform JSON where possible
                //transform JSON where possible
                try {
                    item[key] = JSON.parse(item[key]);
                }
                catch (e) { }
                // transform number
                // transform number
                if (!isNaN(item[key]) && Number(item[key]) % 1 === 0)
                    item[key] = parseInt(item[key]);
                if (!isNaN(item[key]) && Number(item[key]) % 1 !== 0)
                    item[key] = parseFloat(item[key]);
                // transform boolean value
                // transform boolean value
                if (typeof item[key] === 'string' || item[key] instanceof String)
                    item[key] = ((item[key]).toLowerCase() === 'true') || ((item[key]).toLowerCase() === 'false' ? false : item[key]);
                // delete null key
                // delete null key
                if (item[key] === '' || item[key] === null || item[key] === undefined) {
                    delete item[key];
                }
            }
            // custom modifier
            item = customModifier(item, {});
            // transform array to object
            itemsObject = itemsObject || {};
            itemsObject[keyField ? item[keyField] : (item.key || item.slug || ('' + item.id))] = item;
            itemsArray = itemsArray || [];
            itemsArray.push(item);
        });
        return returnObject ? itemsObject : itemsArray;
    };
    SheetbaseService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    SheetbaseService.ctorParameters = function () { return [
        { type: NgZone, },
        { type: HttpClient, },
        { type: undefined, decorators: [{ type: Inject, args: [SheetbaseConfigService,] },] },
    ]; };
    return SheetbaseService;
}());
export { SheetbaseService };
//# sourceMappingURL=sheetbase.service.js.map