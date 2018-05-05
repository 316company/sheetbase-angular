(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common/http'), require('lodash'), require('rxjs'), require('pubsub-js'), require('localforage')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common/http', 'lodash', 'rxjs', 'pubsub-js', 'localforage'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.sheetbase = {}),global.ng.core,global.http,global.lodash,global.rxjs,global.PubSub,global.localforage));
}(this, (function (exports,core,http,lodash,rxjs,PubSub,localforage) { 'use strict';

    var SheetbaseConfigService = new core.InjectionToken('SheetbaseConfig');

    var SpreadsheetService = /** @class */ (function () {
        function SpreadsheetService(ngZone, http$$1, CONFIG) {
            this.ngZone = ngZone;
            this.http = http$$1;
            this.CONFIG = CONFIG;
        }
        SpreadsheetService.prototype.get = function (spreadsheetId, rangeA1, dataType, keyField, returnObject) {
            var _this = this;
            if (dataType === void 0) { dataType = null; }
            if (keyField === void 0) { keyField = null; }
            if (returnObject === void 0) { returnObject = true; }
            return new Promise(function (resolve, reject) {
                if (rangeA1.indexOf(',') < 0) {
                    _this.load(spreadsheetId, rangeA1)
                        .then(function (value) {
                        return _this.ngZone.run(function () {
                            resolve(_this.modifyValue(value, dataType, keyField, returnObject));
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
                            resolve(_this.modifyValue(value, dataType, keyField, returnObject));
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
        SpreadsheetService.prototype.modifyValue = function (value, dataType, keyField, returnObject) {
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
                itemsObject[keyField ? item[keyField] : (item['key'] || item['slug'] || ('' + item['id']) || ('' + item['#']) || ('' + Math.random() * 1E20))] = item;
                itemsArray = itemsArray || [];
                itemsArray.push(item);
            });
            return returnObject ? itemsObject : itemsArray;
        };
        SpreadsheetService.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        SpreadsheetService.ctorParameters = function () { return [
            { type: core.NgZone, },
            { type: http.HttpClient, },
            { type: undefined, decorators: [{ type: core.Inject, args: [SheetbaseConfigService,] },] },
        ]; };
        return SpreadsheetService;
    }());

    var UserDataService = /** @class */ (function () {
        function UserDataService() {
        }
        UserDataService.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        UserDataService.ctorParameters = function () { return []; };
        return UserDataService;
    }());

    var ApiService = /** @class */ (function () {
        function ApiService(http$$1, CONFIG, userDataService) {
            this.http = http$$1;
            this.CONFIG = CONFIG;
            this.userDataService = userDataService;
        }
        /**
         * GET
         * @param endpoint
         * @param params
         */
        /**
           * GET
           * @param endpoint
           * @param params
           */
        ApiService.prototype.GET = /**
           * GET
           * @param endpoint
           * @param params
           */
        function (endpoint, params) {
            var _this = this;
            if (endpoint === void 0) { endpoint = null; }
            if (params === void 0) { params = {}; }
            return new Promise(function (resolve, reject) {
                if (!_this.CONFIG.backendUrl) {
                    console.error('[Error][Sheetbase] No backend for this project!');
                    return reject(null);
                }
                // build uri
                var uri = _this.CONFIG.backendUrl;
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
                if (!endpoint && Object.keys(params).length < 1) {
                    uri += '?apiKey=' + _this.CONFIG.apiKey;
                }
                else {
                    uri += '&apiKey=' + _this.CONFIG.apiKey;
                }
                if (_this.userDataService.token)
                    uri += '&token=' + _this.userDataService.token;
                _this.http.get(uri).subscribe(function (data) {
                    if (data.error)
                        return reject(data);
                    resolve(data);
                }, reject);
            });
        };
        /**
         * POST
         * @param endpoint
         * @param params
         * @param body
         */
        /**
           * POST
           * @param endpoint
           * @param params
           * @param body
           */
        ApiService.prototype.POST = /**
           * POST
           * @param endpoint
           * @param params
           * @param body
           */
        function (endpoint, params, body) {
            var _this = this;
            if (endpoint === void 0) { endpoint = null; }
            if (params === void 0) { params = {}; }
            if (body === void 0) { body = {}; }
            return new Promise(function (resolve, reject) {
                if (!_this.CONFIG.backendUrl) {
                    console.error('[Error][Sheetbase] No backend for this project!');
                    return reject(null);
                }
                // build uri
                var uri = _this.CONFIG.backendUrl;
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
                body = Object.assign({}, body, {
                    apiKey: _this.CONFIG.apiKey
                });
                if (_this.userDataService.token)
                    body.token = _this.userDataService.token;
                _this.http.post(uri, JSON.stringify(body), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).subscribe(function (data) {
                    if (data.error)
                        return reject(data);
                    resolve(data);
                }, reject);
            });
        };
        ApiService.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        ApiService.ctorParameters = function () { return [
            { type: http.HttpClient, },
            { type: undefined, decorators: [{ type: core.Inject, args: [SheetbaseConfigService,] },] },
            { type: UserDataService, },
        ]; };
        return ApiService;
    }());

    var HELPER = {
        o2a: function (object, clone, limit, honorable) {
            if (clone === void 0) { clone = false; }
            if (limit === void 0) { limit = null; }
            if (honorable === void 0) { honorable = false; }
            if (clone && object !== undefined) {
                object = JSON.parse(JSON.stringify(object));
            }
            var array = [];
            for (var key in object) {
                if (typeof object[key] === 'object') {
                    object[key]['$key'] = key;
                }
                else {
                    object[key] = {
                        $key: key,
                        value: object[key]
                    };
                }
                array.push(object[key]);
            }
            if (limit) {
                array.splice(limit, array.length);
            }
            if (honorable && array.length < 1) {
                array = null;
            }
            return array;
        },
        sort: function (value, key, order) {
            if (key === void 0) { key = '$key'; }
            if (order === void 0) { order = 'desc'; }
            return lodash.orderBy(value, [key], [order]);
        }
    };

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
            return new rxjs.Observable(function (observer) {
                var itemsObject = (_this.database || {})[collection];
                // return data
                // return data
                if (itemsObject && Object.keys(itemsObject).length > 0) {
                    observer.next(_this.returnData(collection, doc, query));
                    observer.complete();
                }
                _this.apiService.GET('/data', {
                    table: collection
                }).then(function (response) {
                    _this.ngZone.run(function () {
                        if (!_this.database)
                            _this.database = {};
                        _this.database[collection] = _this.modifyValue(response.data, collection);
                    });
                    observer.next(_this.returnData(collection, doc, query));
                    observer.complete();
                }).catch(function (error) {
                    return rxjs.Observable.throw(error);
                });
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
            { type: core.Injectable },
        ];
        /** @nocollapse */
        DataService.ctorParameters = function () { return [
            { type: core.NgZone, },
            { type: undefined, decorators: [{ type: core.Inject, args: [SheetbaseConfigService,] },] },
            { type: ApiService, },
        ]; };
        return DataService;
    }());

    var UserService = /** @class */ (function () {
        function UserService(ngZone, userDataService, apiService) {
            this.ngZone = ngZone;
            this.userDataService = userDataService;
            this.apiService = apiService;
        }
        UserService.prototype.getToken = function () { return this.userDataService.token; };
        UserService.prototype.getUser = function () { return this.userDataService.user; };
        UserService.prototype.onAuthStateChanged = function () {
            var _this = this;
            return new rxjs.Observable(function (observer) {
                localforage.getItem('sheetbaseAuthData')
                    .then(function (data) {
                    // save data
                    // save data
                    _this.ngZone.run(function () {
                        _this.userDataService.user = data.user;
                        _this.userDataService.token = data.token;
                    });
                    observer.next(data ? data.user : null);
                }).catch(function (error) {
                    observer.next(null);
                });
                PubSub.subscribe('SHEETBASE_AUTH_STATE_CHANGED', function (msg, data) {
                    observer.next(data ? data.user : null);
                });
            });
        };
        UserService.prototype.createUserWithEmailAndPassword = function (email, password) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!email || !password)
                    return reject('Missing email or password!');
                _this.apiService.POST('/user/create', {}, {
                    credential: {
                        email: email,
                        password: password
                    }
                }).then(function (response) {
                    if (response.error)
                        return reject(response);
                    // save data
                    // save data
                    _this.ngZone.run(function () {
                        _this.userDataService.user = response.data.user;
                        _this.userDataService.token = response.data.token;
                    });
                    localforage.setItem('sheetbaseAuthData', response.data)
                        .then(function () { return; })
                        .catch(function (error) { return; });
                    PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
                    resolve(response);
                }).catch(reject);
            });
        };
        UserService.prototype.loginWithEmailAndPassword = function (email, password) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!email || !password)
                    return reject('Missing email or password!');
                if (_this.userDataService.user)
                    resolve({
                        token: _this.userDataService.token,
                        user: _this.userDataService.user
                    });
                _this.apiService.POST('/user/login', {}, {
                    credential: {
                        email: email,
                        password: password
                    }
                }).then(function (response) {
                    if (response.error)
                        return reject(response);
                    // save data
                    // save data
                    _this.ngZone.run(function () {
                        _this.userDataService.user = response.data.user;
                        _this.userDataService.token = response.data.token;
                    });
                    localforage.setItem('sheetbaseAuthData', response.data)
                        .then(function () { return; })
                        .catch(function (error) { return; });
                    PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
                    resolve(response);
                }).catch(reject);
            });
        };
        UserService.prototype.signOut = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.userDataService.user = null;
                _this.userDataService.token = null;
                localforage.removeItem('sheetbaseAuthData')
                    .then(function () { return; })
                    .catch(function (error) { return; });
                PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', null);
                resolve(null);
            });
        };
        UserService.prototype.updateProfile = function (profile) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!profile || !(profile instanceof Object))
                    return reject('Invalid profile data.');
                if (!_this.userDataService.user || !_this.userDataService.token)
                    return reject('Please login first!');
                _this.apiService.POST('/user/profile', {}, {
                    profile: profile
                }).then(function (response) {
                    if (response.error)
                        return reject(response);
                    // save data
                    // save data
                    _this.ngZone.run(function () {
                        _this.userDataService.user = response.data.user;
                    });
                    localforage.setItem('sheetbaseAuthData', {
                        token: _this.userDataService.token,
                        user: response.data.user
                    })
                        .then(function () { return; })
                        .catch(function (error) { return; });
                    PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
                    resolve(response.data.user);
                }).catch(reject);
            });
        };
        UserService.prototype.resetPasswordEmail = function (email) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!email)
                    return reject('Missing email!');
                _this.apiService.POST('/auth/reset-password', {}, {
                    email: email
                }).then(function (response) {
                    if (response.error)
                        return reject(response);
                    resolve(response);
                }).catch(reject);
            });
        };
        UserService.prototype.setPassword = function (oobCode, password) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!oobCode || !password)
                    return reject('Missing oobCode or password!');
                _this.apiService.POST('/auth/set-password', {}, {
                    oobCode: oobCode,
                    password: password
                }).then(function (response) {
                    if (response.error)
                        return reject(response);
                    resolve(response);
                }).catch(reject);
            });
        };
        UserService.prototype.verifyCode = function (oobCode) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!oobCode)
                    return reject('Missing oobCode!');
                _this.apiService.POST('/auth/verify-code', {}, {
                    oobCode: oobCode
                }).then(function (response) {
                    if (response.error)
                        return reject(response);
                    resolve(response);
                }).catch(reject);
            });
        };
        UserService.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        UserService.ctorParameters = function () { return [
            { type: core.NgZone, },
            { type: UserDataService, },
            { type: ApiService, },
        ]; };
        return UserService;
    }());

    var FileService = /** @class */ (function () {
        function FileService(ngZone, apiService) {
            this.ngZone = ngZone;
            this.apiService = apiService;
        }
        FileService.prototype.get = function (fileId) {
            return this.apiService.GET('/file', {
                id: fileId
            });
        };
        // TODO: https://xkeshi.github.io/image-compressor/
        // TODO: https://xkeshi.github.io/image-compressor/
        FileService.prototype.upload = 
        // TODO: https://xkeshi.github.io/image-compressor/
        function (appFile, customFolder) {
            var _this = this;
            if (customFolder === void 0) { customFolder = null; }
            return new rxjs.Observable(function (observer) {
                var body = {
                    file: Object.assign(_this.base64Breakdown(appFile.base64), {
                        name: appFile.name
                    })
                };
                if (customFolder)
                    body.folder = customFolder;
                _this.apiService.POST('/file', {}, body)
                    .then(function (response) {
                    observer.next(response);
                    observer.complete();
                });
            });
        };
        FileService.prototype.load = function (file) {
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    resolve({
                        name: file.name,
                        size: file.size,
                        mimeType: file.type,
                        base64: e.target.result
                    });
                };
                reader.readAsDataURL(file);
            });
        };
        FileService.prototype.base64Breakdown = function (base64Data) {
            var breakdownData = base64Data.split(';base64,');
            return {
                mimeType: breakdownData[0].replace('data:', ''),
                base64String: breakdownData[1]
            };
        };
        FileService.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        FileService.ctorParameters = function () { return [
            { type: core.NgZone, },
            { type: ApiService, },
        ]; };
        return FileService;
    }());

    var SheetbaseModule = /** @class */ (function () {
        function SheetbaseModule() {
        }
        SheetbaseModule.forRoot = function (sheetbaseConfig) {
            return {
                ngModule: SheetbaseModule,
                providers: [
                    {
                        provide: SheetbaseConfigService,
                        useValue: sheetbaseConfig
                    },
                    SpreadsheetService,
                    DataService,
                    ApiService,
                    UserService,
                    UserDataService,
                    FileService,
                ]
            };
        };
        SheetbaseModule.decorators = [
            { type: core.NgModule },
        ];
        return SheetbaseModule;
    }());

    exports.SheetbaseModule = SheetbaseModule;
    exports.SpreadsheetService = SpreadsheetService;
    exports.DataService = DataService;
    exports.ApiService = ApiService;
    exports.UserService = UserService;
    exports.FileService = FileService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
