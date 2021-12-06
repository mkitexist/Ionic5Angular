import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
// import { Plugins } from '@capacitor/core';
// eslint-disable-next-line @typescript-eslint/naming-convention
// const { Storage } = Plugins;
import { Storage } from '@ionic/storage-angular';

export interface AuthResponseData {
  expirationTime: Date;
  email: string;
  expiresIn: string;
  idToken: string;
  kind: string;
  localId: string;
  refreshToken: string;
  registerd?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // eslint-disable-next-line @typescript-eslint/member-ordering
  private userIsAuthenticated = false;
  private userID = null;
  private _user = new BehaviorSubject<User>(null);
  private _storage: Storage | null = null;
  private logoutTimer: any;
  // authData;



  get userAuthenticated() {
    // return this.userIsAuthenticated;
    // eslint-disable-next-line no-underscore-dangle
    return this._user.asObservable().pipe(map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      if (user) {
        return !!user.token;//2 exlamation I used to convert for boolean just like using '+' to convert string to number
      } else {
        return false;
      }
    }));
  }
  get userId() {
    // eslint-disable-next-line no-underscore-dangle
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }
  get token(){
    // eslint-disable-next-line no-underscore-dangle
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.token;
      } else {
        return null;
      }
    }));
  }

  constructor(private http: HttpClient, private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    // eslint-disable-next-line no-underscore-dangle
    this._storage = storage;
    // this.autoLogin(this.authData);
  }
  autoLogin() {
    return from(this.storage.get('authData')).pipe(map(storedData => {
      if (!storedData) {
        return null;
      }
      console.log('storedData', storedData);
      const parsedData = JSON.parse(storedData) as {
        token: string; userId: string; email: string;
        tokenExpirationDate: string;
      };
      console.log(parsedData);
      const expirationTime = new Date(parsedData.tokenExpirationDate);
      if (expirationTime <= new Date()) {
        return null;
      }
      const user = new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime);
      return user;
    }), tap(user => {
      if (user) {
        // eslint-disable-next-line no-underscore-dangle
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
      }
    }), map(user => !!user));
    // return dinga;

  }

  login(email: string, password: string) {
    // this.userIsAuthenticated = true;
    // eslint-disable-next-line max-len
    return this.http.post<AuthResponseData>(` https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}
   `, { email, password, returnSecureToken: true }).pipe(tap(this.setUserData.bind(this)));;


  }

  signUp(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}
`, { email, password, returnSecureToken: true }).pipe(tap(this.setUserData.bind(this)));
  }
  private setUserData(userData: AuthResponseData) {
    // userData => {
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    // eslint-disable-next-line no-underscore-dangle
    this._user.next(user);
    // }
    this.autoLogout(user.tokenDuration);

    this.storeAuthData(userData.localId, userData.idToken, userData.email, expirationTime.toISOString());
  }
  private storeAuthData(
    userId: string,
    token: string,
    email: string,
    tokenExpirationDate: string
  ) {
    const data = JSON.stringify({ userId, token, email, tokenExpirationDate });

    // eslint-disable-next-line no-underscore-dangle
    this.storage?.set('authData', data);

  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async logOut() {
    // this.userIsAuthenticated = false;
    // eslint-disable-next-line no-underscore-dangle
    this._user.next(null);
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    await this.storage.remove('authData');
  }
  private autoLogout(duration: number) {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.logoutTimer = setTimeout(() => {
      this.logOut();
    }, duration);
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  ngOnDestroy(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }
}



