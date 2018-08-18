import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import * as PubSub from 'pubsub-js';
import * as localforage from 'localforage';
import { UserDataService } from './user-data.service';
import { ApiService } from './api.service';
import * as i0 from "@angular/core";
import * as i1 from "./user-data.service";
import * as i2 from "./api.service";
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
        return new Observable(function (observer) {
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
        return new Observable(function (observer) {
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
        return new Observable(function (observer) {
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
        return new Observable(function (observer) {
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
        return new Observable(function (observer) {
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
        return new Observable(function (observer) {
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
        return new Observable(function (observer) {
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
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] },
    ];
    /** @nocollapse */
    UserService.ctorParameters = function () { return [
        { type: NgZone },
        { type: UserDataService },
        { type: ApiService }
    ]; };
    UserService.ngInjectableDef = i0.defineInjectable({ factory: function UserService_Factory() { return new UserService(i0.inject(i0.NgZone), i0.inject(i1.UserDataService), i0.inject(i2.ApiService)); }, token: UserService, providedIn: "root" });
    return UserService;
}());
export { UserService };
//# sourceMappingURL=user.service.js.map