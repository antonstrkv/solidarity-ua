import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, mergeMap, tap, throwError } from "rxjs";

export class Fund {
  public Id: string;
  public title: string;
  public description: string;
  public expireOn: number;
  public imagePath: string;
  public goal: number
  public received: number;
  public direction: string;
  public fundType: string
  public paymentType: string
  public completed: boolean
  public user: userRes
}

class userRes {
  public userFullName: string;
  public userName: string;
  public userId: string;
  public userPhoto: string;
  public userType: string;
  public isVerified?: boolean
}

export const fundPaymentType = {
  LIQPAY: "LiqPay",
  WAYFORPAY: "WayForPay"
}


@Injectable()
export class FundsService {
  fundsList$ = new BehaviorSubject<Fund[]>([]);
  pageIndex$ = new BehaviorSubject<number>(0);
  selectedTypes$ = new BehaviorSubject<string[]>([]);


  changePageIndex(index: number) {
    this.pageIndex$.next(index);
  }

  showAllFunds() {
    this.fundsList$.next(this.funds.slice())
  }

  getFundsList() {
    return this.funds.slice();
  }


  searchObjects(searchText: string, searchOption: string): void {
    searchText = searchText.toLowerCase().trim();

    if (!searchText) {
      this.showAllFunds();
      return;
    };

    const results = this.funds.map(object => ({ ...object })).filter(object => {
      switch (searchOption) {
        case 'title':
          return object.title.toLowerCase().includes(searchText);
        case 'description':
          return object.description.toLowerCase().includes(searchText);
        case 'username':
          return object.user.userName.toLowerCase().includes(searchText);
        default:
          return false;
      }
    });
    this.fundsList$.next(results);
  }

  fetchAllFunds(): Observable<Fund[]> {
    return this.http.post<Fund[]>('/api/funds', {})
      .pipe(
        tap(resData => {
          this.funds = [...resData];
          this.showAllFunds();
        }),
        catchError(this.handleError)
      );
  }



  addFund(fund: any) {
    return this.http.post<any>('/api/fund',
      {
        ...fund
      }
    ).pipe(mergeMap(() => this.fetchAllFunds()), catchError(this.handleError));
  }

  deleteFund(id: string) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        id: id,
      },
    };
    return this.http.delete<any>('/api/fund', options)
      .pipe(
        mergeMap(() => this.fetchAllFunds()), catchError(this.handleError)
      )
  }


  paymentFund(paymentData: any) {
    return this.http.post<any>('/api/payment',
      {
        ...paymentData
      }
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }

  private funds: Fund[] = [];

  constructor(private http: HttpClient) { }

}
