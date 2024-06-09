import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header-logged',
  templateUrl: './header-logged.component.html',
  styleUrls: ['./header-logged.component.css']
})
export class HeaderLoggedComponent implements OnInit, OnDestroy {

  private sub: any;
  userSub: Subscription;
  user$: any;

  constructor(private elementRef: ElementRef, private router: Router, public authService: AuthService) { }

  ngOnInit() {
    this.isMainActive(this.router);
    this.sub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isMainActive(e)
      });
    this.userSub = this.authService.user.subscribe({
      next: (user) => {
        this.user$ = user;
      }
    })
  }

  isMainActive(e: any) {
    const burgerItem = this.elementRef.nativeElement.querySelector(".icon-menu-auth");
    if (e.url === '/main' || e.url.includes('/profile')) {
      burgerItem.classList.add("active-main")
    } else {
      burgerItem.classList.remove("active-main")
    }
  }

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.userSub.unsubscribe();
  }


  ngAfterViewInit() {

    const iconMenuAuth = this.elementRef.nativeElement.querySelector(".icon-menu-auth");
    if (iconMenuAuth) {
      const menuBodyAuth = this.elementRef.nativeElement.querySelector(".menu-burger-auth__body");
      iconMenuAuth.addEventListener("click", function (e: any) {
        document.body.classList.toggle("_lock");
        iconMenuAuth.classList.toggle("menu-open-auth");
        menuBodyAuth.classList.toggle("menu-open-auth");
      });
    }

    const authMenuIcon = this.elementRef.nativeElement.querySelector(".auth-menu__avatar");
    const menuBody = this.elementRef.nativeElement.querySelector(".auth-menu__body");

    authMenuIcon.addEventListener("click", function (e: any) {
      e.stopPropagation();
      menuBody.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
      const isClickInsideMenu =
        authMenuIcon.contains(event.target) || menuBody.contains(event.target);
      if (!isClickInsideMenu) {
        menuBody.classList.remove("active");
      }
    });

  }

}
