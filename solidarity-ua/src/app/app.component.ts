import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Subscription } from 'rxjs';
import { FundsService } from './funds/funds.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isAuth = false;
  userSub: Subscription;

  constructor(private authService: AuthService, private fundsService: FundsService) { }

  ngOnInit(): void {
    this.authService.autoLogin();
    this.fundsService.fetchAllFunds().subscribe(
      funds => {
        console.log('Funds fetched successfully:', funds);
      },
      error => {
        console.error('Error fetching funds:', error);
      }
    );
    this.userSub = this.authService.user.subscribe({
      next: (user) => {
        this.isAuth = !!user;
      }
    })
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
