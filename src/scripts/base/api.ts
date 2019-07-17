import { ApiProxy } from "ApiProxy";

type APIQueryArgCollection = ApiTypes.APIQueryArgCollection;
type APIBodyArgCollection = ApiTypes.APIBodyArgCollection;
type ApiBaseResult = ApiTypes.ApiBaseResult;

export namespace api {
  export const AUTH_ERROR_CODES = ApiProxy.AUTH_ERROR_CODES;

  function get<T extends ApiBaseResult=any>(path: string, urlArgs?: APIQueryArgCollection): ApiProxy<T> {
    return new ApiProxy<T>("GET", path, urlArgs)
  }

  function post<T extends ApiBaseResult=any>(path: string, urlArgs?: APIQueryArgCollection, bodyArgs?: APIBodyArgCollection): ApiProxy<T> {
    return new ApiProxy<T>("POST", path, urlArgs, bodyArgs)
  }

  // ================
  // api declarations
  // ===============

  export function testPost() :ApiProxy<ApiBaseResult> {
    return post("/test",{},{})
  }

  export function testGet() :ApiProxy<ApiBaseResult> {
    return get("/test",{})
  }

  export function wxappAuth(
    code: string, userInfo: wx.UserInfo, iv: string, encryptedData: string, inviterOpenid: string, userOpenid: string, inviterToken: string
  ): ApiProxy<ApiBaseResult & { user: Models.User }> {
    return post("/auth/wxapp_login", { inviterOpenid, userOpenid, inviterToken }, { code, iv, encryptedData });
  }


}

export default api;
