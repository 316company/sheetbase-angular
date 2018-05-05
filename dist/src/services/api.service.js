import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SheetbaseConfigService } from './sheetbase-config.service';
import { UserDataService } from './user-data.service';
var ApiService = /** @class */ (function () {
    function ApiService(http, CONFIG, userDataService) {
        this.http = http;
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
        { type: Injectable },
    ];
    /** @nocollapse */
    ApiService.ctorParameters = function () { return [
        { type: HttpClient, },
        { type: undefined, decorators: [{ type: Inject, args: [SheetbaseConfigService,] },] },
        { type: UserDataService, },
    ]; };
    return ApiService;
}());
export { ApiService };
//# sourceMappingURL=api.service.js.map