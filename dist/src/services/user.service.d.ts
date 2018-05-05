import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
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
    createUserWithEmailAndPassword(email: string, password: string): Promise<any>;
    loginWithEmailAndPassword(email: string, password: string): Promise<{}>;
    signOut(): Promise<any>;
    updateProfile(profile: any): Promise<any>;
    resetPasswordEmail(email: string): Promise<any>;
    setPassword(oobCode: string, password: string): Promise<any>;
    verifyCode(oobCode: string): Promise<any>;
}
