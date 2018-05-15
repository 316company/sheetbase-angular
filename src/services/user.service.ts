import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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

  getToken(): string { return this.userDataService.token }

  getUser(): any { return this.userDataService.user }

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

  createUserWithEmailAndPassword(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      if(!email || !password) return observer.error('Missing email or password!');

      this.apiService.POST('/user/create', {},
        {
          credential: {
            email,
            password
          }
        }
      ).subscribe(response => {
        if(response.error) return observer.error(response);
        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.data.user;
          this.userDataService.token = response.data.token;
        });

        localforage.setItem('sheetbaseAuthData', response.data)
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
        observer.next(response);
      }, error => observer.error(error));
    });
  }

  signInWithEmailAndPassword(email: string, password: string) {
    return new Observable(observer => {
      if(!email || !password) return observer.error('Missing email or password!');

      if(this.userDataService.user) observer.next({
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
      ).subscribe(response => {
        if(response.error) return observer.error(response);

        // save data
        this.ngZone.run(() => {
          this.userDataService.user = response.data.user;
          this.userDataService.token = response.data.token;
        });

        localforage.setItem('sheetbaseAuthData', response.data)
        .then(() => {return})
        .catch(error => {return});

        PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', response.data);
        observer.next(response);
      }, error => observer.error(error));
    });
  }

  signOut(): Observable<any> {
    return new Observable(observer => {
      this.userDataService.user = null;
      this.userDataService.token = null;

      localforage.removeItem('sheetbaseAuthData')
      .then(() => {return})
      .catch(error => {return});

      PubSub.publish('SHEETBASE_AUTH_STATE_CHANGED', null);
      observer.next(null);
    });
  }

  updateProfile(profile: any): Observable<any> {
    return new Observable(observer => {
      if(!profile || !(profile instanceof Object)) return observer.error('Invalid profile data.');

      if(!this.userDataService.user || !this.userDataService.token) return observer.error('Please login first!');

      this.apiService.POST('/user/profile', {},
        {
          profile
        }
      ).subscribe(response => {
        if(response.error) return observer.error(response);

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
        observer.next(response.data.user);
      }, error => observer.error(error));
    });
  }

  sendPasswordResetEmail(email: string): Observable<any> {
    return new Observable(observer => {
      if(!email) return observer.error('Missing email!');

      this.apiService.POST('/auth/reset-password', {},
        {
          email
        }
      ).subscribe(response => {
        if(response.error) return observer.error(response);
        observer.next(response);
      }, error => observer.error(error));
    });
  }

  confirmPasswordReset(actionCode: string, newPassword: string): Observable<any> {
    return new Observable(observer => {
      if(!actionCode || !newPassword) return observer.error('Missing actionCode or password!');

      this.apiService.POST('/auth/set-password', {},
        {
          code: actionCode,
          newPassword
        }
      ).subscribe(response => {
        if(response.error) return observer.error(response);
        observer.next(response);
      }, error => observer.error(error));
    });
  }


  applyActionCode(actionCode: string): Observable<any> {
    return new Observable(observer => {
      if(!actionCode) return observer.error('Missing actionCode!');

      this.apiService.POST('/auth/verify-code', {},
        {
          code: actionCode
        }
      ).subscribe(response => {
        if(response.error) return observer.error(response);
        observer.next(response);
      }, error => observer.error(error));
    });
  }

}
