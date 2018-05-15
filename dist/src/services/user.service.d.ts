import { NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UserDataService } from './user-data.service';
import { ApiService } from './api.service';
export declare class UserService {
    private ngZone;
    private userDataService;
    private apiService;
    constructor(ngZone: NgZone, userDataService: UserDataService, apiService: ApiService);
    getToken(): string;
    getUser(): any;
    onAuthStateChanged(): Observable<any>;
    createUserWithEmailAndPassword(email: string, password: string): Observable<any>;
    signInWithEmailAndPassword(email: string, password: string): Observable<{}>;
    signOut(): Observable<any>;
    updateProfile(profile: any): Observable<any>;
    sendPasswordResetEmail(email: string): Observable<any>;
    confirmPasswordReset(actionCode: string, newPassword: string): Observable<any>;
    applyActionCode(actionCode: string): Observable<any>;
}
