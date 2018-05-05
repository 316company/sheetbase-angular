import { Injectable, Inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SheetbaseConfigService } from './sheetbase-config.service';
var SpreadsheetService = /** @class */ (function () {
    function SpreadsheetService(ngZone, http, CONFIG) {
        this.ngZone = ngZone;
        this.http = http;
        this.CONFIG = CONFIG;
    }
    SpreadsheetService.prototype.get = function (rangeA1, tableName, keyField, returnObject) {
        if (rangeA1 === void 0) { rangeA1 = 'A1:ZZ'; }
        if (tableName === void 0) { tableName = null; }
        if (keyField === void 0) { keyField = null; }
        if (returnObject === void 0) { returnObject = true; }
        return this.getData(this.CONFIG.databaseId, rangeA1, tableName, keyField, returnObject);
    };
    SpreadsheetService.prototype.getData = function (spreadsheetId, rangeA1, tableName, keyField, returnObject) {
        var _this = this;
        if (rangeA1 === void 0) { rangeA1 = 'A1:ZZ'; }
        if (tableName === void 0) { tableName = null; }
        if (keyField === void 0) { keyField = null; }
        if (returnObject === void 0) { returnObject = true; }
        return new Promise(function (resolve, reject) {
            if (rangeA1.indexOf(',') < 0) {
                _this.load(spreadsheetId, rangeA1)
                    .then(function (value) {
                    return _this.ngZone.run(function () {
                        resolve(_this.modifyValue(value, tableName, keyField, returnObject));
                    });
                })
                    .catch(reject);
            }
            else {
                var rangeStr_1 = '';
                ((rangeA1.split(',')).map(function (x) { return x.trim(); }) || []).forEach(function (range) {
                    rangeStr_1 += '&ranges=' + range;
                });
                _this.loadBatch(spreadsheetId, rangeStr_1)
                    .then(function (value) {
                    return _this.ngZone.run(function () {
                        resolve(_this.modifyValue(value, tableName, keyField, returnObject));
                    });
                })
                    .catch(reject);
            }
        });
    };
    SpreadsheetService.prototype.load = function (id, range) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.http.get("https://sheets.googleapis.com/v4/spreadsheets/" + id + "/values/" + range + "?key=" + _this.CONFIG.googleApiKey)
                .subscribe(function (response) {
                resolve(_this.transformValue(response.values));
            }, reject);
        });
    };
    SpreadsheetService.prototype.transformValue = function (value) {
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
    SpreadsheetService.prototype.loadBatch = function (id, ranges) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.http.get("https://sheets.googleapis.com/v4/spreadsheets/" + id + "/values:batchGet?" + ranges + "&key=" + _this.CONFIG.googleApiKey)
                .subscribe(function (response) {
                resolve(_this.transformBatchValue(response.valueRanges));
            }, reject);
        });
    };
    SpreadsheetService.prototype.transformBatchValue = function (value) {
        var _this = this;
        // round 1
        var base = this.transformValue(value[0].values || []);
        var more = [];
        (value.slice(1, value.length) || []).forEach(function (item) {
            more.push(_this.transformValue(item.values || []));
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
    SpreadsheetService.prototype.modifyValue = function (value, tableName, keyField, returnObject) {
        var customModifier = function (item, tools) {
            if (tools === void 0) { tools = {}; }
            return item;
        };
        if (tableName && this.CONFIG.modifiers && this.CONFIG.modifiers[tableName])
            customModifier = this.CONFIG.modifiers[tableName];
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
            itemsObject[keyField ? item[keyField] : (item['key'] || item['slug'] || ('' + item['id']) || ('' + item['#']) || ('' + Math.random() * 1E20))] = item;
            itemsArray = itemsArray || [];
            itemsArray.push(item);
        });
        return returnObject ? itemsObject : itemsArray;
    };
    SpreadsheetService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    SpreadsheetService.ctorParameters = function () { return [
        { type: NgZone, },
        { type: HttpClient, },
        { type: undefined, decorators: [{ type: Inject, args: [SheetbaseConfigService,] },] },
    ]; };
    return SpreadsheetService;
}());
export { SpreadsheetService };
//# sourceMappingURL=spreadsheet.service.js.map