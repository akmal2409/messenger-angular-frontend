import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { OKTA_AUTH } from "@okta/okta-angular";
import { getOAuthUrls, OAuthResponse, OktaAuth, Tokens } from "@okta/okta-auth-js";
import { RxStompConfig } from "@stomp/rx-stomp";
import { defaultIfEmpty, from, map, mergeMap, Observable, of, shareReplay, switchMap, take, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { rxStompConfig } from "../config/rx-stomp.config";
import { ClientError } from "../model/shared/client-error.model";
import { AUTHENTICATION_ERROR_NOT_AUTHENTICATED, AUTHENTICATION_REFRESH_TOKEN_EXPIRED } from "../model/shared/error.codes";
import { User } from "../model/user/user.model";
import { UserService } from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user$: Observable<User> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly injector: Injector,
    private readonly userService: UserService,
    private readonly router: Router
  ) {

  }

  private get oktaAuth() {
    return this.injector.get(OKTA_AUTH);
  }

  get accessToken() {
    return this.oktaAuth.getAccessToken()!;
  }

  get user$(): Observable<User> {
    if (!this._user$) {
      this._user$ = this.isAuthenticated$
        .pipe(defaultIfEmpty(false),
          take(1),
          switchMap(isAuthenticated => {
            if (!isAuthenticated) {
              return throwError(() => new ClientError('Authentication Failure',
                'User is not authenticated when trying to get current user in auth service',
                undefined, AUTHENTICATION_ERROR_NOT_AUTHENTICATED))
            }

            return from(this.oktaAuth.tokenManager.getTokens())
              .pipe(map(tokens => tokens.idToken?.claims?.sub));
          }),
          switchMap((userId) => {
            if (!userId) {
              return throwError(() => new ClientError('Auhentication Failure',
                'User ID (sub) from an ID token claims property was null',
                undefined, AUTHENTICATION_ERROR_NOT_AUTHENTICATED));
            }

            return this.userService.getUserByUid(userId);
          }),
          shareReplay(1));
    }

    return this._user$;
  }

  get isAuthenticated$(): Observable<boolean> {
    return new Observable(observer => {
      this.oktaAuth.isAuthenticated()
        .then(val => observer.next(val))
        .catch(err => observer.error(err))
        .finally(() => observer.complete());
    });
  }


  public async signOut() {
    await this.oktaAuth.signOut();
    this.router.navigate(['/']);
  }

  public singInWithRedirect() {
    this.oktaAuth.signInWithRedirect();
  }

  /**
   * The method calls Okta Endpoint with a refresh token from the store
   * and automatically updates user's credentials upon successfull request.
   * @returns
   */
  public renewUsingRefreshToken(): Observable<string> {
    const refreshToken = this.oktaAuth.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new ClientError('Authentication error', 'Refresh token expired',
        undefined, AUTHENTICATION_REFRESH_TOKEN_EXPIRED));
    }


    const formDetails: { [key: string]: string } = {
      grant_type: 'refresh_token',
      redirect_uri: `${window.location.host}/login/callback`,
      client_id: environment.clientId,
      refresh_token: refreshToken
    }

    const formBody = Object.keys(formDetails)
      .map(key => `${key}=${formDetails[key]}`)
      .join('&');

    return this.http.post<Required<OAuthResponse>>(environment.tokenEndpoint, formBody, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      })
    }).pipe(map(tokenResponse => {
      const tokens = this.parseOauthResponse(tokenResponse);
      this.oktaAuth.tokenManager.clear();
      this.oktaAuth.tokenManager.setTokens(tokens);

      return this.oktaAuth.getAccessToken()!;
    }))
  }

  /**
  * The following method extracts the OAuthResponse returned by okta /token endpoint
  * to the Tokens model that later is loaded into the tokenManager again provided by Okta SDK.
  * The response contains, access, id and refresh tokens as well as validity of each and the URLs.
  * @param response OAuthReponse containing tokens
  * @returns
  */
  private parseOauthResponse(response: OAuthResponse): Tokens {
    let scopes: string[] = [];
    if (response.scope) {
      scopes = response.scope.split(' ');
    }

    const clientId = this.oktaAuth.options.clientId;

    const tokenDict = {} as Tokens;
    const expiresIn = response.expires_in;
    const tokenType = response.token_type;
    const accessToken = response.access_token;
    const idToken = response.id_token;
    const refreshToken = response.refresh_token;
    const now = Math.floor(Date.now() / 1000);
    const urls = getOAuthUrls(this.oktaAuth);

    if (accessToken) {
      var accessJwt = this.oktaAuth.token.decode(accessToken);
      tokenDict.accessToken = {
        accessToken: accessToken,
        claims: accessJwt.payload,
        expiresAt: Number(expiresIn) + now,
        tokenType: tokenType!,
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl!,
        userinfoUrl: urls.userinfoUrl!
      };
    }

    if (refreshToken) {
      tokenDict.refreshToken = {
        refreshToken: refreshToken,
        expiresAt: Number(expiresIn) + now,
        scopes: scopes,
        tokenUrl: urls.tokenUrl!,
        authorizeUrl: urls.authorizeUrl!,
        issuer: urls.issuer!,
      };
    }

    if (idToken) {
      const idJwt = this.oktaAuth.token.decode(idToken);
      tokenDict.idToken = {
        idToken: idToken,
        claims: idJwt.payload,
        expiresAt: idJwt.payload.exp! - idJwt.payload.iat! + now, // adjusting expiresAt to be in local time
        scopes: scopes,
        authorizeUrl: urls.authorizeUrl!,
        issuer: urls.issuer!,
        clientId: clientId!
      };
    }

    return tokenDict;
  }
}
