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
      this.apiService.POST('/user/create', {},
        {
          credential: {
            email,
            password
          }
        }
      ).then(response => {
        if(response.error) reject(response);
        if(!response.token) {
          console.error('[Error][Sheetbase][User] No auth endpoint user/create found in backend!');
          reject(null);
        }

        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.user;
          this.userDataService.token = response.token;
        });

        localforage.setItem('sheetbaseAuthData', response)
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response);
        resolve(response);
      }).catch(reject);
    });
  }

  loginWithEmailAndPassword(email: string, password: string) {
    return new Promise((resolve, reject) => {
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
        if(response.error) reject(response);
        if(!response.token) {
          console.error('[Error][Sheetbase][User] No auth endpoint user/login found in backend!');
          reject(null);
        }

        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.user;
          this.userDataService.token = response.token;
        });

        localforage.setItem('sheetbaseAuthData', response)
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response);
        resolve(response);
      }).catch(reject);
    });
  }

  signOut(): Promise<any> {
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

  updateProfile(profileData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.POST('/user/profile', {},
        {
          profileData
        }
      ).then(response => {
        if(response.error) reject(response);
        if(!response.user) {
          console.error('[Error][Sheetbase][User] No auth endpoint user/profile found in backend!');
          reject(null);
        }

        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.user;
        });

        localforage.setItem('sheetbaseAuthData', {
          token: this.userDataService.token,
          user: response.user
        })
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response);
        resolve(response.user);
      }).catch(reject);
    });
  }


}
