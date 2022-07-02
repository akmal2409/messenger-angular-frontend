import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable, Injector } from "@angular/core";
import { OKTA_AUTH } from "@okta/okta-angular";
import { getOAuthUrls, OAuthResponse, OktaAuth, Tokens } from "@okta/okta-auth-js";
import { map, Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { ClientError } from "../model/shared/client-error.model";
import { AUTHENTICATION_REFRESH_TOKEN_EXPIRED } from "../model/shared/error.codes";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private readonly http: HttpClient,
    private readonly injector: Injector
  ) {

  }

  private get oktaAuth() {
    return this.injector.get(OKTA_AUTH);
  }

  get accessToken() {
    return this.oktaAuth.getAccessToken()!;
  }

  public signOut() {
    this.oktaAuth.signOut();
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
