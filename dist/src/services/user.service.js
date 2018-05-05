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
    UserService.prototype.logout = function () {
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
                code: oobCode,
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
                code: oobCode
            }).then(function (response) {
                if (response.error)
                    return reject(response);
                resolve(response);
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