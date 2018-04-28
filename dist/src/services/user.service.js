import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import * as PubSub from 'pubsub-js';
import * as localforage from 'localforage';
import { UserDataService } from './user-data.service';
import { ApiService } from './api.service';
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
        return new Observable(function (observer) {
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
            _this.apiService.POST('/user/create', {}, {
                credential: {
                    email: email,
                    password: password
                }
            }).then(function (response) {
                if (response.error)
                    reject(response);
                if (!response.token) {
                    console.error('[Error][Sheetbase][User] No auth endpoint user/create found in backend!');
                    reject(null);
                }
                // save data
                // save data
                _this.ngZone.run(function () {
                    _this.userDataService.user = response.user;
                    _this.userDataService.token = response.token;
                });
                localforage.setItem('sheetbaseAuthData', response)
                    .then(function () { return; })
                    .catch(function (error) { return; });
                PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response);
                resolve(response);
            }).catch(reject);
        });
    };
    UserService.prototype.loginWithEmailAndPassword = function (email, password) {
        var _this = this;
        return new Promise(function (resolve, reject) {
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
                    reject(response);
                if (!response.token) {
                    console.error('[Error][Sheetbase][User] No auth endpoint user/login found in backend!');
                    reject(null);
                }
                // save data
                // save data
                _this.ngZone.run(function () {
                    _this.userDataService.user = response.user;
                    _this.userDataService.token = response.token;
                });
                localforage.setItem('sheetbaseAuthData', response)
                    .then(function () { return; })
                    .catch(function (error) { return; });
                PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response);
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
    UserService.prototype.updateProfile = function (profileData) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.apiService.POST('/user/profile', {}, {
                profileData: profileData
            }).then(function (response) {
                if (response.error)
                    reject(response);
                if (!response.user) {
                    console.error('[Error][Sheetbase][User] No auth endpoint user/profile found in backend!');
                    reject(null);
                }
                // save data
                // save data
                _this.ngZone.run(function () {
                    _this.userDataService.user = response.user;
                });
                localforage.setItem('sheetbaseAuthData', {
                    token: _this.userDataService.token,
                    user: response.user
                })
                    .then(function () { return; })
                    .catch(function (error) { return; });
                PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response);
                resolve(response.user);
            }).catch(reject);
        });
    };
    UserService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    UserService.ctorParameters = function () { return [
        { type: NgZone, },
        { type: UserDataService, },
        { type: ApiService, },
    ]; };
    return UserService;
}());
export { UserService };
//# sourceMappingURL=user.service.js.map