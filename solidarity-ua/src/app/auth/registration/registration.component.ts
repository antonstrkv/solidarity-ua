import { Component, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  isLoading = false;
  error: string = '';
  isShowPassword: boolean = false;

  constructor(private elementRef: ElementRef, private authService: AuthService, private router: Router) { }

  onSubmit(Form: NgForm) {
    if (!Form.valid) return;
    const email = Form.value.email;
    const password = Form.value.password;
    const confirmPassword = Form.value.confirmPassword;
    const fullName = Form.value.fullName;
    const userName = Form.value.userName;
    const userType = Form.value.select;
    const description = Form.value.description;

    if (password !== confirmPassword) {
      alert('Пароль не співпадає');
      return;
    } else {
      let authObs: Observable<AuthResponseData>;
      authObs = this.authService.signup(email, password, fullName, userName, userType, description);

      authObs.subscribe({
        next: (resData) => {
          console.log(resData);
          this.isLoading = false;
          this.router.navigate(['./main']);
        },
        error: (errorMessage) => {
          console.log(errorMessage);
          this.error = errorMessage;
          //?????????????
          this.isLoading = false;
        }
      });
    }
    Form.reset();
  }

  ngAfterViewInit() {
    const eyeIcons = this.elementRef.nativeElement.querySelectorAll('.registration__hide');
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
      }
      );
    });
  }
}
