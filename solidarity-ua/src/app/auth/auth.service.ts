import { HttpClient} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, catchError, tap, throwError } from "rxjs";
import { User, UserV2 } from "./user.model";


export interface AuthResponseData {
  idToken: string,
  email: string,
  expiresIn: string,
  registered?: string,
  userData?: UserV2
}

@Injectable()
export class AuthService {
  user = new BehaviorSubject<User | null>(null);
  userSaved: User | null;
  private tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) { }

  addFavoriteFund(fundId: number) {
    if (this.userSaved && this.userSaved.userData && !(this.userSaved.userData.favoriteFunds as Number[]).includes(fundId)) {
      (this.userSaved.userData.favoriteFunds as Number[]).push(fundId);
      this.user.next(this.userSaved);
      localStorage.setItem('userData', JSON.stringify(this.userSaved));
    }
    console.log(this.userSaved?.userData?.favoriteFunds)
    this.editUser().subscribe();
  }

  removeFavoriteFund(fundId: number) {
    if (this.userSaved && this.userSaved.userData) {
      let index = (this.userSaved.userData.favoriteFunds as Number[]).indexOf(fundId);

      if (index > -1) {
        (this.userSaved.userData.favoriteFunds as Number[]).splice(index, 1);
        this.user.next(this.userSaved);
      }
    }
    console.log(this.userSaved?.userData?.favoriteFunds)
    this.editUser().subscribe();
  }


  editUser() {
    return this.http.put<AuthResponseData>('/api/user',
      {
        "id": this.userSaved?.userData?.Id,
        "email": this.userSaved?.userData?.email,
        "name": this.userSaved?.userData?.fullName,
        "username": this.userSaved?.userData?.username,
        "position": this.userSaved?.userData?.userType,
        "description": this.userSaved?.userData?.description,
        "verified": this.userSaved?.userData?.verified,
        "photo": this.userSaved?.userData?.photo,
        "favorite_funds": (this.userSaved?.userData?.favoriteFunds)?.toString()
      }).pipe(
        catchError(this.handleError)
      );
  }



  getFavoriteFunds(): string[] {
    if (this.userSaved && this.userSaved.userData?.favoriteFunds) {
      return this.userSaved.userData.favoriteFunds.slice();
    }
    return [];
  }


  logout() {
    this.user.next(null);
    this.userSaved = null;
    this.router.navigate(['/main']);
    localStorage.removeItem("userData");
    if (this.tokenTimer) clearTimeout(this.tokenTimer);
    this.tokenTimer = null;
  }


  signup(email: string, password: string, fullName: string, userName: string, userType: string, description: string) {
    return this.http.post<AuthResponseData>('/api/user',
      {
        email,
        password,
        "name": fullName,
        "username": userName,
        "position": userType,
        description
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(resData.email, resData.idToken, +resData.expiresIn, resData.userData);
    }));
  }


  login(email: string, password: string) {
    return this.http.post<AuthResponseData>('/api/login',
      {
        email,
        password,
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(resData.email, resData.idToken, +resData.expiresIn, resData.userData);
    }));
  }


  autoLogin(): void {
    const userDataString = localStorage.getItem('userData');
    let userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string,
      userData: UserV2
    } | null = null;

    if (userDataString) {
      userData = JSON.parse(userDataString);
    }

    if (!userData) return;

    const loadedUser = new User(userData.email, userData._token, new Date(userData._tokenExpirationDate), userData.userData);

    if (loadedUser.token) {
      this.userSaved = loadedUser;
      this.user.next(loadedUser);
      const experationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(experationDuration);
    }
  }


  autoLogout(experationDuration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, experationDuration)
  }


  handleAuthentication(email: string, localId: string, expiresIn: number, userData?: UserV2) {
    const experationDate = new Date(new Date().getTime() + expiresIn * 1000)
    const user = new User(email, localId, experationDate, userData);
    this.userSaved = user;
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }


  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
