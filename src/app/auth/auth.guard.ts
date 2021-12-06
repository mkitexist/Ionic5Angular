import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) { }
  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // throw new Error('Method not implemented.');
    // if (!this.authService.userAuthenticated) {
    //   this.router.navigateByUrl('/auth');
    // }
    return this.authService.userAuthenticated.pipe(take(1), switchMap(isauthenticated => {
      if (!isauthenticated) {
        return this.authService.autoLogin();
      } else {
        return of(isauthenticated);
      }
    }), tap(isAutjenticated => {
      if (!isAutjenticated) {
        this.router.navigateByUrl('/auth');
      }
    }
    )
    );
  }


}
