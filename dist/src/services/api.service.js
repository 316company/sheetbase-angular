import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SheetbaseConfigService } from './sheetbase-config.service';
import { UserDataService } from './user-data.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./sheetbase-config.service";
import * as i3 from "./user-data.service";
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
    ApiService.prototype.GET = function (endpoint, params) {
        var _this = this;
        if (endpoint === void 0) { endpoint = null; }
        if (params === void 0) { params = {}; }
        return new Observable(function (observer) {
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
    ApiService.prototype.POST = function (endpoint, params, body) {
        var _this = this;
        if (endpoint === void 0) { endpoint = null; }
        if (params === void 0) { params = {}; }
        if (body === void 0) { body = {}; }
        return new Observable(function (observer) {
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
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] },
    ];
    /** @nocollapse */
    ApiService.ctorParameters = function () { return [
        { type: HttpClient },
        { type: undefined, decorators: [{ type: Inject, args: [SheetbaseConfigService,] }] },
        { type: UserDataService }
    ]; };
    ApiService.ngInjectableDef = i0.defineInjectable({ factory: function ApiService_Factory() { return new ApiService(i0.inject(i1.HttpClient), i0.inject(i2.SheetbaseConfigService), i0.inject(i3.UserDataService)); }, token: ApiService, providedIn: "root" });
    return ApiService;
}());
export { ApiService };
//# sourceMappingURL=api.service.js.map