import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthResponseData, AuthService } from '../auth.service';
import { PlaceholderDirective } from 'src/app/shared/alert/placeholder/placeholder.directive';
import { AlertComponent } from 'src/app/shared/alert/alert.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  private closeSub: Subscription;
  isShowPassword: boolean = false;
  isLoading = false;
  error: string = '';
  @ViewChild(PlaceholderDirective, { static: true }) alertHost: PlaceholderDirective;

  constructor(private elementRef: ElementRef, private authService: AuthService, private router: Router) { }


  onSubmit(Form: NgForm) {
    if (!Form.valid) return;
    const email = Form.value.email;
    const password = Form.value.password;

    let authObs: Observable<AuthResponseData>;
    this.isLoading = true;
    authObs = this.authService.login(email, password);

    authObs.subscribe({
      next: (resData) => {
        this.isLoading = false;
        this.router.navigate(['./main']);
      },
      error: (errorMessage) => {
        this.error = errorMessage;
        this.isLoading = false;
      }
    });

    Form.reset();
  }


  showErrorAlert(message: string) {
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();
    const componentRef = hostViewContainerRef.createComponent(AlertComponent);
    componentRef.instance.message = message;
    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    })
  }


  ngAfterViewInit() {
    const eyeIcons = this.elementRef.nativeElement.querySelectorAll('.authorization__hide');
    eyeIcons.forEach((icon: any) => {
      icon.addEventListener("click", () => {
        const currentSrc = icon.getAttribute("src");
        if (currentSrc === "/assets/img/authorization/eye-off.svg") {
          icon.setAttribute("src", "/assets/img/authorization/eye.svg");
          this.isShowPassword = true;
        } else {
          icon.setAttribute("src", "/assets/img/authorization/eye-off.svg");
          this.isShowPassword = false;
        }
      });
    });
  }


  ngOnDestroy(): void {
    if (this.closeSub) this.closeSub.unsubscribe();
  }

}
