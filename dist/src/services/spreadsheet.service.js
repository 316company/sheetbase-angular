import { Injectable, Inject, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { SheetbaseConfigService } from './sheetbase-config.service';
var SpreadsheetService = /** @class */ (function () {
    function SpreadsheetService(ngZone, http, CONFIG) {
        this.ngZone = ngZone;
        this.http = http;
        this.CONFIG = CONFIG;
    }
    SpreadsheetService.prototype.get = function (tableName, range, keyField, returnObject) {
        if (range === void 0) { range = 'A1:ZZ'; }
        if (keyField === void 0) { keyField = null; }
        if (returnObject === void 0) { returnObject = true; }
        return this.getData(this.CONFIG.databaseId, tableName + '!' + range, tableName, keyField, returnObject);
    };
    SpreadsheetService.prototype.getData = function (spreadsheetId, rangeA1, type, keyField, returnObject) {
        var _this = this;
        return new Observable(function (observer) {
            if (rangeA1.indexOf(',') < 0) {
                _this.load(spreadsheetId, rangeA1)
                    .subscribe(function (value) {
                    return _this.ngZone.run(function () {
                        observer.next(_this.modifyValue(value, type, keyField, returnObject));
                    });
                }, function (error) { return observer.error(error); });
            }
            else {
                var rangeStr_1 = '';
                ((rangeA1.split(',')).map(function (x) { return x.trim(); }) || []).forEach(function (range) {
                    rangeStr_1 += '&ranges=' + range;
                });
                _this.loadBatch(spreadsheetId, rangeStr_1)
                    .subscribe(function (value) {
                    return _this.ngZone.run(function () {
                        observer.next(_this.modifyValue(value, type, keyField, returnObject));
                    });
                }, function (error) { return observer.error(error); });
            }
        });
    };
    SpreadsheetService.prototype.load = function (id, range) {
        var _this = this;
        return new Observable(function (observer) {
            _this.http.get("https://sheets.googleapis.com/v4/spreadsheets/" + id + "/values/" + range + "?key=" + _this.CONFIG.googleApiKey)
                .subscribe(function (response) {
                observer.next(_this.transformValue(response.values));
            }, function (error) { return observer.error(error); });
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
        return new Observable(function (observer) {
            _this.http.get("https://sheets.googleapis.com/v4/spreadsheets/" + id + "/values:batchGet?" + ranges + "&key=" + _this.CONFIG.googleApiKey)
                .subscribe(function (response) {
                observer.next(_this.transformBatchValue(response.valueRanges));
            }, function (error) { return observer.error(error); });
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
            for (var key in item) {
                //transform JSON where possible
                try {
                    item[key] = JSON.parse(item[key]);
                }
                catch (e) { }
                // transform number
                if (!isNaN(item[key]) && Number(item[key]) % 1 === 0)
                    item[key] = parseInt(item[key]);
                if (!isNaN(item[key]) && Number(item[key]) % 1 !== 0)
                    item[key] = parseFloat(item[key]);
                // transform boolean value
                if (typeof item[key] === 'string' || item[key] instanceof String)
                    item[key] = ((item[key]).toLowerCase() === 'true') || ((item[key]).toLowerCase() === 'false' ? false : item[key]);
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