import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import * as PubSub from 'pubsub-js';
import * as localforage from 'localforage';

import { UserDataService } from './user-data.service';
import { ApiService } from './api.service';

@Injectable()
export class UserService {

  constructor(
    private ngZone: NgZone,

    private userDataService: UserDataService,
    private apiService: ApiService,
  ) {
  }

  getToken() { return this.userDataService.token }

  getUser() { return this.userDataService.user }

  onAuthStateChanged(): Observable<any> {
    return new Observable(observer => {
      localforage.getItem<any>('sheetbaseAuthData')
      .then(data => {

        // save data
        this.ngZone.run(() => {
          this.userDataService.user = data.user;
          this.userDataService.token = data.token;
        });

        observer.next(data ? data.user: null);
      }).catch(error => {
        observer.next(null);
      });

      PubSub.subscribe('SHEETBASE_AUTH_STATE_CHANGED', (msg, data) => {
        observer.next(data ? data.user: null);
      });
    });
  }

  createUserWithEmailAndPassword(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!email || !password) return reject('Missing email or password!');

      this.apiService.POST('/user/create', {},
        {
          credential: {
            email,
            password
          }
        }
      ).then(response => {
        if(response.error) return reject(response);
        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.data.user;
          this.userDataService.token = response.data.token;
        });

        localforage.setItem('sheetbaseAuthData', response.data)
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
        resolve(response);
      }).catch(reject);
    });
  }

  loginWithEmailAndPassword(email: string, password: string) {
    return new Promise((resolve, reject) => {
      if(!email || !password) return reject('Missing email or password!');

      if(this.userDataService.user) resolve({
        token: this.userDataService.token,
        user: this.userDataService.user
      });

      this.apiService.POST('/user/login', {},
        {
          credential: {
            email,
            password
          }
        }
      ).then(response => {
        if(response.error) return reject(response);

        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.data.user;
          this.userDataService.token = response.data.token;
        });

        localforage.setItem('sheetbaseAuthData', response.data)
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
        resolve(response);
      }).catch(reject);
    });
  }

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userDataService.user = null;
      this.userDataService.token = null;

      localforage.removeItem('sheetbaseAuthData')
      .then(() => {return})
      .catch(error => {return});

      PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', null);
      resolve(null);
    });
  }

  updateProfile(profile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!profile || !(profile instanceof Object)) return reject('Invalid profile data.');

      if(!this.userDataService.user || !this.userDataService.token) return reject('Please login first!');

      this.apiService.POST('/user/profile', {},
        {
          profile
        }
      ).then(response => {
        if(response.error) return reject(response);

        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.data.user;
        });

        localforage.setItem('sheetbaseAuthData', {
          token: this.userDataService.token,
          user: response.data.user
        })
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
        resolve(response.data.user);
      }).catch(reject);
    });
  }

  resetPasswordEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!email) return reject('Missing email!');

      this.apiService.POST('/auth/reset-password', {},
        {
          email
        }
      ).then(response => {
        if(response.error) return reject(response);
        resolve(response);
      }).catch(reject);
    });
  }

  setPassword(oobCode: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!oobCode || !password) return reject('Missing oobCode or password!');

      this.apiService.POST('/auth/set-password', {},
        {
          code: oobCode,
          password
        }
      ).then(response => {
        if(response.error) return reject(response);
        resolve(response);
      }).catch(reject);
    });
  }


  verifyCode(oobCode: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if(!oobCode) return reject('Missing oobCode!');

      this.apiService.POST('/auth/verify-code', {},
        {
          code: oobCode
        }
      ).then(response => {
        if(response.error) return reject(response);
        resolve(response);
      }).catch(reject);
    });
  }

}
