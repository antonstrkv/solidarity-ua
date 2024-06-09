import { Component, ElementRef, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private sub: any;

  constructor(private elementRef: ElementRef, private router: Router) { }

  ngOnInit() {
    this.isMainActive(this.router);
    this.sub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isMainActive(e)
      });
  }

  isMainActive(e: any) {
    const burgerItem = this.elementRef.nativeElement.querySelector(".icon-menu");
    if (e.url === '/main' || e.url.includes('/profile')) {
      burgerItem.classList.add("active-main")
    } else {
      burgerItem.classList.remove("active-main")
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngAfterViewInit() {

    const iconMenu = this.elementRef.nativeElement.querySelector(".icon-menu");
    if (iconMenu) {
      const menuBody = this.elementRef.nativeElement.querySelector(".menu__body");
      iconMenu.addEventListener("click", function (e: any) {
        document.body.classList.toggle("_lock");
        iconMenu.classList.toggle("menu-open");
        menuBody.classList.toggle("menu-open");
      });
    }

  }

}


