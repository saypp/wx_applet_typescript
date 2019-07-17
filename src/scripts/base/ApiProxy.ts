import utils from "utils";

type APIQueryArgCollection = ApiTypes.APIBodyArgCollection;
type APIBodyArgCollection = ApiTypes.APIBodyArgCollection;
type ApiBaseResult = ApiTypes.ApiBaseResult;
type HTTPStatusCode = ApiTypes.HTTPStatusCode;
type ApiSentCallback = (success: boolean) => void;

const MAX_REQ_PAYLOAD = 5;

class RequestManager {
  private currentPayload: number = 0;
  private queue: ApiProxy[] = [];
  add(proxy: ApiProxy) {
    if (this.currentPayload < MAX_REQ_PAYLOAD) {
      this.currentPayload += 1;
      proxy.doSend(() => {
        this.handleReqComplete()
      })
    } else {
      this.queue.push(proxy);
    }
  }
  private handleReqComplete() {
    this.currentPayload -= 1;
    if (this.currentPayload < MAX_REQ_PAYLOAD) {
      let next = this.queue.shift();
      if (next) {
        this.add(next);
      }
    }
  }
}

let reqManager = new RequestManager();

export class ApiProxy<T extends ApiBaseResult = ApiBaseResult> {
  static host = "";
  static basePath = "";
  static accessToken = "";
  static readonly AUTH_ERROR_CODES = new Set([10031, 10032, 10036]);
  static maxReqPayload = 5;
  static authErrorHandler: (errCode: number) => void | true;
  static commonErrorHandler(resData: ApiBaseResult, httpStatusCode: HTTPStatusCode) {
    console.log("common error handler handleRes", { resData, httpStatusCode });
    if (resData) {
      if (this.AUTH_ERROR_CODES.has(resData.statusCode)) {
        // 用户认证错误
        // TODO
        if (this.authErrorHandler) {
          if (this.authErrorHandler(resData.statusCode) == true) {
            return null;
          }
        }
        return utils.alert("请求失败，" + resData.statusMessage + " (" + resData.statusCode + ")");
      } else {
        return setTimeout(() => {
          return utils.alert("请求失败，" + resData.statusMessage + " (" + resData.statusCode + ")");
        }, 1);
      }
    } else {
      if (httpStatusCode) {
        return setTimeout(() => {
          return utils.alert("请求失败，请检查网络设置后重试 (" + httpStatusCode + ")");
        }, 1);
      } else {
        console.error("got http error, httpStatusCode undefined, not report");
        return null;
      }
    }
  };

  private method: "GET" | "POST";
  private path: string;
  private defaultPrevented: boolean = false;
  private headers: { [name: string]: string } = {};
  private urlArgs?: APIQueryArgCollection;
  private bodyArgs?: APIBodyArgCollection;
  private mockResult?: T;
  private mockDelay: number;
  private camelizePrevented: boolean = false;

  //callbacks
  private onSuccess: (result: T) => true | void;
  private onFail: (httpStatusCode: HTTPStatusCode) => true | void;
  private onError: (msg: string, statusCode: number, data?: any) => true | void;
  private onFailOrError: (httpStatusCode: HTTPStatusCode, msg?: string, statusCode?: number, data?: any) => true | void;
  private onAlways: () => void;

  constructor(method: "GET" | "POST", path: string, urlArgs?: APIQueryArgCollection, body?: APIBodyArgCollection) {
    this.method = method;
    this.path = path;
    this.urlArgs = urlArgs;
    if (method == "POST") {
      this.bodyArgs = body;
    } else {
      if (body) {
        console.error("body:", body);
        throw new Error(`GET api call ${path} shouldn't have a body`);
      }
    }
    setTimeout(() => {
      this.send();
    }, 0)
  }

  /** 此方法由 manager 调用 */
  doSend(callback: ApiSentCallback) {
    if (this.method === "GET") {
      this.sendGet(callback);
    } else {
      this.sendPost(callback);
    }
  }

  private send() {
    if (this.mockResult) {
      setTimeout(() => {
        console.warn("[mock] mock api result for api call:", this.path, this);
        if (this.onSuccess) {
          this.onSuccess(this.mockResult);
        }
        if (this.onAlways) {
          this.onAlways();
        }
      }, this.mockDelay) //sim network latency for a little bit
      return
    }
    reqManager.add(this);
  }

  private getAuthHeaders(): { [key: string]: string } {
    return { "X-Access-Token": ApiProxy.accessToken };
  }

  private sendGet(callback: ApiSentCallback) {
    let path: string;
    if (this.path.indexOf("http") === 0) {
      path = utils.underlizeKey(this.path);
    } else {
      path = ApiProxy.host + ApiProxy.basePath + utils.underlizeKey(this.path);
    }
    let url = utils.genApiUrl(path, utils.underlize(this.urlArgs));
    let headers = this.getAuthHeaders();
    for (let key in this.headers) {
      headers[key] = this.headers[key];
    }
    wx.request({
      url: url,
      method: "GET",
      dataType: "text",
      header: headers,
      success: (res, httpStatus) => {
        this.handleRes(true, httpStatus, res["data"]);
        callback(true);
      },
      fail: (res, httpStatus) => {
        // TODO: is http status null?
        this.handleRes(false, httpStatus, res);
        callback(false);
      },
    })
  }

  private sendPost(callback: ApiSentCallback) {
    let path: string;
    if (this.path.indexOf("http") === 0) {
      path = utils.underlizeKey(this.path);
    } else {
      path = ApiProxy.host + ApiProxy.basePath + utils.underlizeKey(this.path);
    }
    let url = utils.genApiUrl(path, utils.underlize(this.urlArgs));
    let data: string;
    let headers = this.getAuthHeaders();
    for (let key in this.headers) {
      headers[key] = this.headers[key];
    }
    if (this.bodyArgs) {
      data = JSON.stringify(utils.underlize(this.bodyArgs));
      headers["Content-Type"] = "application/json";
    }
    console.log(url, "url");
    wx.request({
      url: url,
      method: "POST",
      dataType: "text",
      header: headers,
      data: data || "",
      success: (res, httpStatus) => {
        console.log(res);
        this.handleRes(true, httpStatus, res["data"]);
        callback(true);
      },
      fail: (res) => {
        this.handleRes(false, null, res);
        callback(false);
      }
    })
  }

  private handleRes(reqSuccess: boolean, httpStatusCode: HTTPStatusCode, data?: object | string) {
    let preventCamelize = this.camelizePrevented;
    let parsedData: T;
    if (!reqSuccess) {
      // reqSuccess 为 false 说明 http 请求本身失败
      console.error("HTTP Error " + httpStatusCode + " for api call: " + this.path);
      let skipDefault = false;
      if (this.onFail) {
        let ans = this.onFail(httpStatusCode);
        if (ans === true) {
          skipDefault = true;
        }
      }
      if (this.onFailOrError) {
        let ans = this.onFailOrError(httpStatusCode);
        if (ans === true) {
          skipDefault = true;
        }
      }
      if (!skipDefault && !this.defaultPrevented) {
        ApiProxy.commonErrorHandler(null, httpStatusCode);
      }
    } else {
      // reqSuccess 为 true 说明 http 请求本身成功，需要进一步判断返回值
      let objData: object;
      if (typeof data === "string") {
        try {
          objData = JSON.parse(data);
        } catch (error) {
          console.log(this);
          console.error("parse api res error");
          console.log({ apiResData: data });
          console.error(error);
          objData = {
            success: false,
            statusCode: 0,
            statusMessage: "无法解析请求返回值"
          };
        }
      } else {
        objData = data;
      }
      if (!preventCamelize) {
        parsedData = utils.camelize(objData) as T;
      } else {
        parsedData = objData as T;
        parsedData.statusCode = (data as any)["status_code"];
        parsedData.statusMessage = (data as any)["status_message"];
      }
      if (parsedData.success) {
        if (this.onSuccess) {
          try {
            this.onSuccess(parsedData);
          } catch (error) {
            console.error("Api Success Callback Error for " + this.path);
            throw error;
          }
        }
      } else {
        console.error("got error for api call", this.path);
        console.error(parsedData.statusCode, parsedData.statusMessage, { apiProxy: this });
        let skipDefault = false;
        if (this.onError) {
          let ans = this.onError(parsedData.statusMessage, parsedData.statusCode, parsedData);
          if (ans === true) {
            skipDefault = true;
          }
        }
        if (this.onFailOrError) {
          let ans = this.onFailOrError(httpStatusCode, parsedData.statusMessage, parsedData.statusCode, parsedData);
          if (ans === true) {
            skipDefault = true;
          }
        }
        if (new Set([10033]).has(parsedData.statusCode)) {
          // 特定类型的报错不会抛出默认的 alert，它们包括：
          // - 10033 没有操作此公众号的权限（可能由于它已经解绑）
          skipDefault = true;
        }
        if (!skipDefault && !this.defaultPrevented) {
          ApiProxy.commonErrorHandler(parsedData, 200);
        }
      }
    }
    if (this.onAlways) {
      return this.onAlways();
    }
  }

  /**
   * 设置api成功回调
   * @param callback 成功回调
   */
  success(callback: (result: T) => true | void): this {
    this.onSuccess = callback;
    return this;
  }

  /**
   * 设置 api 失败回调，会在 http 请求不成功时触发
   * @param callback 失败回调，若返回 true 则会阻止默认的 alert 行为
   */
  fail(callback: (httpStatusCode: HTTPStatusCode) => true | void): this {
    this.onFail = callback;
    return this;
  }

  /**
   * 设置 api 错误回调，会在 http 请求成功，但是响应结果中 success 字段为 false 时触发
   * @param callback 错误回调，若返回true则会阻止默认的alert行为
   */
  error(callback: (msg: string, statusCode: number, data?: any) => true | void): this {
    this.onError = callback;
    return this
  }

  /**
   * 设置 api 失败或错误回调，会在 http 请求失败或者响应结果中 success 字段为 false 时触发
   * @param callback 错误或失败回调，若返回true则会阻止默认的alert行为
   */
  failOrError(callback: (httpStatusCode: HTTPStatusCode, msg?: string, statusCode?: number, data?: any) => true | void): this {
    this.onFailOrError = callback;
    return this;
  }

  /**
   * 设置 api 结束回调，不论 api 成功或失败，都会调用此回调。适用场景是一些不需关心 api 本身是否失败的场景（比如按钮解锁）
   * @param callback 回调函数。函数没有参数，如果需要参数，应当使用其他的方法
   */
  always(callback: () => void): this {
    this.onAlways = callback;
    return this;
  }

  /**
   * 阻止api结果处理环节中的默认操作（比如弹出默认的alert提示）
   */
  preventDefault(): this {
    this.defaultPrevented = true;
    return this;
  }

  /**
   * 是否禁用api结果中的驼峰转换（不对基础字段生效)
   */
  preventCamelize(): this {
    this.camelizePrevented = true;
    return this;
  }

  /**
   * 设置请求 header
   * @param name 名称
   * @param value 值
   */
  setHeader(name: string, value: string): this {
    this.headers[name] = value;
    return this;
  }

  /**
   * 为 api 调用设置虚拟返回值，用于方便调试
   * @param data 虚拟返回值 必须和标准的返回值是同一格式
   */
  mock(data: T, mockDelay: number = 300): this {
    this.mockResult = data;
    if (!this.mockResult.success) {
      this.mockResult.success = true;
      this.mockResult.statusCode = 200;
      this.mockResult.statusMessage = "ok";
    }
    this.mockDelay = mockDelay;
    return this;
  }
}

export default ApiProxy;