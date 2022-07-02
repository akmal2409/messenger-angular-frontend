import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError } from 'rxjs';
import { ClientError } from 'src/app/model/shared/client-error.model';
import { CLIENT_SIDE_INTERNAL_ERROR } from 'src/app/model/shared/error.codes';
import { AuthService } from 'src/app/service/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly authService: AuthService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.handleAccess(request, next);
  }

  /**
   * The main authentication filter chain of the application.
   * It will append the authorization header if and only if the URL was listed in the environmnet.ts
   * file.
   * Two potential outcomes (exluding successfull request):
   * 1) In case of a JS client side error, it is rethrown and sent down the filter chain to the ERROR
   * interceptor.
   * 2) In case of a HTTP 401 response, there are two possibilities, either the token became invalid
   * and we have to rotate it or the user was blacklisted and all subsequent requests will be dropped.
   * In such case we have to block other possible parallel requests by using BehviourSubject that holds
   * the latest access token (by default during the refresh token rotation, subject will hold a NULL value).
   * It was designed so that in case multiple requests come into the interceptor that all receive 401 response,
   * the very first one is designated to actually trigger token rotation, while the calls that arrived after
   * must wait for the Subject to emit the rotated access token.
   *
   * @param request
   * @param next
   * @returns
   */
  private handleAccess(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add an access token to allowed origins
    if (environment.allowedOrigins.some(url => request.urlWithParams.includes(url))) {
      request = this.addAuthHeader(request, this.authService.accessToken);
    }

    return next.handle(request)
      .pipe(catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
          // most likely token expired and we have to renew it using refresh token
          return this.handleAuthError(request, next);
        }

        // client side error, rethrow and propagate to the the ErrorInterceptor
        return throwError(() => new ClientError('Internal client error occured',
          'JS specific error occurred', error, CLIENT_SIDE_INTERNAL_ERROR));
      }));
  }

  private handleAuthError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return this.tokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addAuthHeader(request, token!));
        })
      );
    } else {
      this.isRefreshing = true;
      this.tokenSubject.next(null);

      return this.authService.renewUsingRefreshToken()
        .pipe(
          catchError(error => {
            if (error instanceof HttpErrorResponse) {
              // Could not authenticate, logout user.

              this.authService.signOut();
              this.authService.singInWithRedirect();
              return throwError(() => new ClientError('Authentication failure',
                'Error from IDP while renewing the access token', error, CLIENT_SIDE_INTERNAL_ERROR));;
            }


            this.authService.signOut();
            this.authService.singInWithRedirect();
            return throwError(() => new ClientError('Internal client error occured',
              'JS specific error occurred during token refresh', error, CLIENT_SIDE_INTERNAL_ERROR));
          }),
          switchMap(accessToken => {
            console.log('Received tokens after refreshing', accessToken);

            this.tokenSubject.next(accessToken);
            return next.handle(this.addAuthHeader(request, accessToken));
          }),
          finalize(() => {
            this.isRefreshing = false;
          })
        )
    }
  }

  /**
   * Adds authorization header with a bearer token to the HTTP headers.
   *
   * @param request
   * @param token
   * @returns
   */
  private addAuthHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }


}
