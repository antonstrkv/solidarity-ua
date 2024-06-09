import { Injectable } from "@angular/core";
import { Observable, Subject, catchError, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";


export class Profile {
  "Id": string
  "username": string
  "name": string
  "position": string
  "email": string
  "description": string
  "verified": number
  "photo": string | null
  "facebook"?: string
  "instagram"?: string
  "telegram"?: string
}

@Injectable()
export class ProfileService {
  currentProfile$ = new Subject<Profile>();

  fetchProfile(userName: string) {
    return this.http.post<Profile>('/api/oneuser',
    {
      "username": userName,
    }).pipe(
      catchError(this.handleError)
    );
  }

  setProfile(profile: Profile) {
    this.currentProfile$.next(profile)
  }

  Profiles: Profile[] = []

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }

  constructor(private http: HttpClient) { }
}
