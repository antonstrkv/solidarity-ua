import { Component, ElementRef } from '@angular/core';
import { Fund, FundsService } from '../funds/funds.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-myfunds',
  templateUrl: './myfunds.component.html',
  styleUrls: ['./myfunds.component.css']
})
export class MyfundsComponent {
  AllFunds: Array<Fund> = [];
  Sub: Subscription;
  selectedOption: string = 'title';
  sortOrderDesc: boolean = true;
  sortGoal: 'asc' | 'desc' = 'desc';
  isSortByGoal: boolean = true;

  changeSortGoal() {
    this.isSortByGoal = true;
    if (this.sortGoal === 'desc') {
      this.sortGoal = 'asc'
    } else {
      this.sortGoal = 'desc'
    }
  }

  changesortOrder() {
    this.isSortByGoal = false;
    this.sortOrderDesc = !this.sortOrderDesc;
    this.AllFunds = [...this.AllFunds];
  }


  onSelected(value: string) {
    this.selectedOption = value;
  }

  ngOnInit(): void {
    this.Sub = this.fundsService.fundsList$.subscribe((funds: Fund[]) => {
      this.AllFunds = funds;
    })
  }

  ngOnDestroy(): void {
    this.Sub.unsubscribe();
  }


  constructor(private elementRef: ElementRef, public fundsService: FundsService, public authService: AuthService) { }



}



