import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Fund, FundsService } from './funds.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-funds',
  templateUrl: './funds.component.html',
  styleUrls: ['./funds.component.css']
})
export class FundsComponent implements OnInit {
  AllFunds: Array<Fund> = [];
  Sub: Subscription;
  selectedOption: string = 'title';
  pageSize = 9;
  pageIndex = 1
  TYPES = {
    Equipment: "Обладнання",
    Treatment: "Лікування",
    Social: "Соц. підтримка",
    Military: "Військ. потреби",
    Rehabilitation: "Реабілітація",
  }
  selectedTypes: string[] = [];
  IsVerifiedFilter: boolean = false;
  IsCompletedFilter: boolean = false;
  IsExpiredFilter: boolean = false;
  IsInProgressFilter: boolean = false;
  sortOrderDesc: boolean = true;
  sortGoal: 'asc' | 'desc' = 'desc';
  isSortByGoal: boolean = true;
  shouldFilterSaved: boolean;

  changeShouldFilterSaved() {
    this.shouldFilterSaved = !this.shouldFilterSaved;
  }

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

  changeIsVerifiedFilter() {
    this.IsVerifiedFilter = !this.IsVerifiedFilter
  }

  changeIsCompletedFilter() {
    this.IsCompletedFilter = !this.IsCompletedFilter
  }

  changeIsExpiredFilter() {
    this.IsExpiredFilter = !this.IsExpiredFilter
  }

  changeIsInProgressFilter() {
    this.IsInProgressFilter = !this.IsInProgressFilter
  }

  onPageIndex() {
    this.pageIndex = this.pageIndex + 1
    this.fundsService.changePageIndex(this.pageIndex)
  }

  toggleType(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index >= 0) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.fundsService.selectedTypes$.next([...this.selectedTypes]);
  }


  onSearch(searchText: string) {
    this.fundsService.searchObjects(searchText, this.selectedOption);

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

  ngAfterViewInit() {
    const selectBtn = this.elementRef.nativeElement.querySelector(".select-btn"),
      items = this.elementRef.nativeElement.querySelectorAll(".item");

    selectBtn.addEventListener("click", () => {
      selectBtn.classList.toggle("open");
    });

    items.forEach((item: any) => {
      item.addEventListener("click", () => {
        item.classList.toggle("checked");
      });
    });
  }

}
