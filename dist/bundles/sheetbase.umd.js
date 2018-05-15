(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs/Observable'), require('@angular/common/http'), require('lodash'), require('pubsub-js'), require('localforage')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'rxjs/Observable', '@angular/common/http', 'lodash', 'pubsub-js', 'localforage'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.sheetbase = {}),global.ng.core,global.Rx,global.http,global.lodash,global.PubSub,global.localforage));
}(this, (function (exports,core,Observable,http,lodash,PubSub,localforage) { 'use strict';

    var SheetbaseConfigService = new core.InjectionToken('SheetbaseConfig');

    var SpreadsheetService = /** @class */ (function () {
        function SpreadsheetService(ngZone, http$$1, CONFIG) {
            this.ngZone = ngZone;
            this.http = http$$1;
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
            return new Observable.Observable(function (observer) {
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
            return new Observable.Observable(function (observer) {
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
            return new Observable.Observable(function (observer) {
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
            return new Observable.Observable(function (observer) {
                if (!_this.CONFIG.backendUrl) {
                    return observer.error('[Error][Sheetbase] No backend for this project!');
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
                        return observer.error(data);
                    observer.next(data);
                }, function (error) { return observer.error(error); });
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
            return new Observable.Observable(function (observer) {
                if (!_this.CONFIG.backendUrl) {
                    return observer.error('[Error][Sheetbase] No backend for this project!');
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
                        return observer.error(data);
                    observer.next(data);
                }, function (error) { return observer.error(error); });
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
        function DataService(ngZone, CONFIG, apiService, spreadsheetService) {
            this.ngZone = ngZone;
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
            return new Observable.Observable(function (observer) {
                var itemsObject = (_this.database || {})[collection];
                // return data
                if (itemsObject && Object.keys(itemsObject).length > 0) {
                    observer.next(_this.returnData(collection, doc, query));
                }
                var dataGetter = _this.getData(collection, doc, query);
                if (_this.CONFIG.googleApiKey && _this.CONFIG.databaseId) {
                    dataGetter = _this.getDataSolutionLite(collection, doc, query);
                }
                dataGetter.subscribe(function (result) {
                    _this.ngZone.run(function () {
                        if (!_this.database)
                            _this.database = {};
                        _this.database[collection] = result;
                    });
                    observer.next(_this.returnData(collection, doc, query));
                }, function (error) { return observer.error(error); });
            });
        };
        DataService.prototype.getData = function (collection, doc, query) {
            var _this = this;
            return new Observable.Observable(function (observer) {
                _this.apiService.GET('/data', {
                    table: collection
                }).subscribe(function (response) {
                    observer.next(_this.modifyValue(response.data, collection));
                }, function (error) { return observer.error(error); });
            });
        };
        DataService.prototype.getDataSolutionLite = function (collection, doc, query) {
            var _this = this;
            return new Observable.Observable(function (observer) {
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
                        // true === true
                        (query.equalTo === '!null' && !!value) || // any (#false) === '!null'
                        // any (#false) === '!null'
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
            { type: SpreadsheetService, },
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
            return new Observable.Observable(function (observer) {
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
            return new Observable.Observable(function (observer) {
                if (!email || !password)
                    return observer.error('Missing email or password!');
                _this.apiService.POST('/user/create', {}, {
                    credential: {
                        email: email,
                        password: password
                    }
                }).subscribe(function (response) {
                    if (response.error)
                        return observer.error(response);
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
                    observer.next(response);
                }, function (error) { return observer.error(error); });
            });
        };
        UserService.prototype.signInWithEmailAndPassword = function (email, password) {
            var _this = this;
            return new Observable.Observable(function (observer) {
                if (!email || !password)
                    return observer.error('Missing email or password!');
                if (_this.userDataService.user)
                    observer.next({
                        token: _this.userDataService.token,
                        user: _this.userDataService.user
                    });
                _this.apiService.POST('/user/login', {}, {
                    credential: {
                        email: email,
                        password: password
                    }
                }).subscribe(function (response) {
                    if (response.error)
                        return observer.error(response);
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
                    observer.next(response);
                }, function (error) { return observer.error(error); });
            });
        };
        UserService.prototype.signOut = function () {
            var _this = this;
            return new Observable.Observable(function (observer) {
                _this.userDataService.user = null;
                _this.userDataService.token = null;
                localforage.removeItem('sheetbaseAuthData')
                    .then(function () { return; })
                    .catch(function (error) { return; });
                PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', null);
                observer.next(null);
            });
        };
        UserService.prototype.updateProfile = function (profile) {
            var _this = this;
            return new Observable.Observable(function (observer) {
                if (!profile || !(profile instanceof Object))
                    return observer.error('Invalid profile data.');
                if (!_this.userDataService.user || !_this.userDataService.token)
                    return observer.error('Please login first!');
                _this.apiService.POST('/user/profile', {}, {
                    profile: profile
                }).subscribe(function (response) {
                    if (response.error)
                        return observer.error(response);
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
                    observer.next(response.data.user);
                }, function (error) { return observer.error(error); });
            });
        };
        UserService.prototype.sendPasswordResetEmail = function (email) {
            var _this = this;
            return new Observable.Observable(function (observer) {
                if (!email)
                    return observer.error('Missing email!');
                _this.apiService.POST('/auth/reset-password', {}, {
                    email: email
                }).subscribe(function (response) {
                    if (response.error)
                        return observer.error(response);
                    observer.next(response);
                }, function (error) { return observer.error(error); });
            });
        };
        UserService.prototype.confirmPasswordReset = function (actionCode, newPassword) {
            var _this = this;
            return new Observable.Observable(function (observer) {
                if (!actionCode || !newPassword)
                    return observer.error('Missing actionCode or password!');
                _this.apiService.POST('/auth/set-password', {}, {
                    code: actionCode,
                    newPassword: newPassword
                }).subscribe(function (response) {
                    if (response.error)
                        return observer.error(response);
                    observer.next(response);
                }, function (error) { return observer.error(error); });
            });
        };
        UserService.prototype.applyActionCode = function (actionCode) {
            var _this = this;
            return new Observable.Observable(function (observer) {
                if (!actionCode)
                    return observer.error('Missing actionCode!');
                _this.apiService.POST('/auth/verify-code', {}, {
                    code: actionCode
                }).subscribe(function (response) {
                    if (response.error)
                        return observer.error(response);
                    observer.next(response);
                }, function (error) { return observer.error(error); });
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
        function (appFile, customFolder, customName) {
            var _this = this;
            if (customFolder === void 0) { customFolder = null; }
            if (customName === void 0) { customName = null; }
            return new Observable.Observable(function (observer) {
                if (!appFile)
                    return observer.error('No local file!');
                var body = {
                    file: Object.assign(_this.base64Breakdown(appFile.base64), {
                        name: appFile.name
                    })
                };
                if (customFolder)
                    body.folder = customFolder;
                if (customName)
                    body.name = customName;
                _this.apiService.POST('/file', {}, body)
                    .subscribe(function (response) {
                    observer.next(response);
                }, function (error) { return observer.error(error); });
            });
        };
        FileService.prototype.load = function (file) {
            return new Observable.Observable(function (observer) {
                if (!file)
                    return observer.error(null);
                var reader = new FileReader();
                reader.onload = function (e) {
                    observer.next({
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
