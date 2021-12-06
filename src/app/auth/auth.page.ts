import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  // eslint-disable-next-line max-len
  constructor(private authService: AuthService, private router: Router, private loadingController: LoadingController, private alertCtrl: AlertController) { }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isLoading = false;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  isLogin = true;
  ngOnInit() {
  }
  authenticate(email: string, password: string) {
    this.isLoading = true;
    // this.authService.login();
    this.loadingController.create({ keyboardClose: true, message: 'Loading...' }).then(loadEl => {
      loadEl.present();
      let $auth: Observable<AuthResponseData>;
      if (this.isLogin) {
        $auth = this.authService.login(email, password);

      } else {
        $auth = this.authService.signUp(email, password);
      }
      $auth.subscribe((res) => {
        this.isLoading = false;
        loadEl.dismiss();
        this.router.navigateByUrl('/places/discover');
        console.log(res);
      }, err => {
        loadEl.dismiss();

        const error = err?.error?.error?.message;
        let message = 'Could not sign you up,please try again.';
        if (error === 'EMAIL_EXISTS') {
          message = 'Thisemail address exists already!';
        } else if (error === 'EMAIL_NOT_FOUND') {
          message = 'Email address could not be found';
        }
        else if (error === 'INVALID_PASSWORD') {
          message = 'This password is not correct.';
        }
        this.showAlert(message);
        console.log('ERROR', err);
      });
      // setTimeout(() => {
      //   this.isLoading = false;
      //   loadEl.dismiss();
      //   this.router.navigateByUrl('/places/discover');
      // }, 1500);
    });
  }
  onSubmit(f: NgForm) {
    if (!f.valid) {
      return;
    }
    const email = f.value.email;
    const password = f.value.password;
    // if (this.isLogin) {

    // } else {

    // }
    this.authenticate(email, password);
    f.reset();
  }
  onSwitchMode() {
    this.isLogin = !this.isLogin;
    // this.isLogin = this.isLogin === true ? false : true;

  }
  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authentication failed',
      message,
      buttons: ['Okay']
    }).then(alert => alert.present());
  }
}
