import { HttpParams } from "@angular/common/http"

export const queryParams = (params: { [key: string]: any }) => {
  let queryParams = new HttpParams();

  for (const key in params) {
    if (params[key]) {
      queryParams = queryParams.append(key, params[key]);
    }
  }

  return queryParams;
}
