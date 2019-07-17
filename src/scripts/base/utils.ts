export namespace utils {

  export const KEYS = {
    "ENTER": 13,
    "BACKSPACE": 8
  }

  /**
 * 当数值大于1000时，返回以k为单位的字符串
 * @param count number类型
 */
  export function genUnit(count: number): string {
    let _count = count.toString();
    if (_count.length > 3) {
      _count = _count.slice(0, _count.length - 3) + 'k';
    }
    return _count;
  }

  /**
   * 获得URL中”？“后面的参数 以键值对的形式放回
   * @param url string类型
   */
  export function getUrlArgs(url: string = window.location.href, camelize = false): { [key: string]: string } {
    // remove url hash
    let [href] = url.split("#");
    let s = href.split("?")[1];
    if (!s) {
      return {};
    }
    let args: {
      [key: string]: string
    } = {}
    for (let a of s.split("&")) {
      let part = a.split("=");
      let s: string;
      try {
        s = decodeURIComponent(part[1]);
      } catch (error) {
        s = part[1];
      }
      args[part[0]] = s;
    }
    if (camelize) {
      args = utils.camelize(args);
    }
    return args;
  }

  /**
   * 生成URL链接
   * @param path URL中的路径
   * @param queryArgs URL中 “?” 后面的参数
   */
  export function genApiUrl(path: string, queryArgs: object): string {
    if (!queryArgs) {
      queryArgs = {};
    }
    let args: string[] = [];
    for (let key in queryArgs as any) {
      let v = (queryArgs as any)[key];
      if (v !== null) {
        args.push(`${key}=${v}`);
      }
    }
    if (args.length === 0) {
      return path
    } else {
      return `${path}?${args.join("&")}`;
    }
  }

  /**
   * 从当前页面的 url hash 中获取所有参数，以键值对形式返回
   */
  export function getHashArgs(): { [key: string]: string } {
    let hash: string = window.location.hash;
    if (!hash) {
      return {}
    } else {
      return utils.getUrlArgs(`?${hash.slice(1)}`)
    }
  }

  /**
   * 向当前页面的 url hash 中添加指定参数，会按照 url query 的方式组织
   * @param key 参数名 string
   * @param value 参数值 string | null  为 null 的时候是将哈希 key 和 对应的值  清除
   */
  export function setHashArg(key: string, value: string | null) {
    let args = utils.getHashArgs()
    if (value === null) {
      if (args[key]) {
        delete args[key]
      } else {
        throw new Error(`invalid ${key}`);
      }
    } else {
      args[key] = value;
    }
    window.location.hash = utils.genApiUrl("", args).slice(1);
  }

  /**
   * 将key字符串转换成下划线方式命名 (如 "some_name") 的字符串
   * @param key 对象字符串
   * @param ignoreFirst 是否忽略第一个大写字母，如果忽略，会将其当成小写字母处理
   */
  export function underlizeKey(key: string, ignoreFirst: boolean = false): string {
    let out: string[] = [];
    let i: number = 0;
    let lowerCasedStr: string = key.toString().toLowerCase();
    while (i < key.length) {
      if (key[i] !== lowerCasedStr[i]) {
        if (!ignoreFirst || i !== 0) {
          out.push("_");
          out.push(lowerCasedStr[i]);
          i++;
          continue;
        }
      }
      out.push(key[i].toLocaleLowerCase());
      i++;
    }
    return out.join("");
  }

  /**
   * 将对象键值对中的 key 转换为按照下划线方式命名的 key
   * @param obj 需要转换的对象
   */
  export function underlize(obj: object): Object {
    if (obj === null || obj === undefined) {
      return null;
    } else if (obj instanceof Array) {
      return obj.map((item) => {
        return utils.underlize(item);
      })
    } else if (typeof obj === "object") {
      let out: any = {}
      for (let key in obj as any) {
        let v = (obj as any)[key];
        out[utils.underlizeKey(key)] = utils.underlize(v)
      }
      return out;
    } else {
      return obj;
    }
  }

  /**
   * 将key字符串转换成中划线方式命名 (如 "some-name") 的字符串
   * @param key 对象字符串
   * @param ignoreFirst 是否忽略第一个大写字母，如果忽略，会将其当成小写字母处理
   */
  export function middlelizeKey(key: string, ignoreFirst: boolean = false): string {
    let out: string[] = [];
    let i: number = 0;
    let lowerCasedStr = key.toString().toLowerCase();
    while (i < key.length) {
      if (key[i] !== lowerCasedStr[i]) {
        if (!ignoreFirst || i !== 0) {
          out.push("-");
          out.push(lowerCasedStr[i]);
          i++;
          continue;
        }
      }
      out.push(key[i].toLocaleLowerCase());
      i++;
    }
    return out.join("");
  }

  /**
   * 将对象键值对中的 key 转换为按照下划线方式命名的 key
   * @param obj 需要转换的对象
   */
  export function middlelize(obj: object): object {
    if (obj === null || obj === undefined) {
      return null;
    } else if (obj instanceof Array) {
      return obj.map((item) => {
        return utils.underlize(item);
      })
    } else if (typeof obj === "object") {
      let out: any = {};
      for (let key in (obj as any)) {
        let v = (obj as any)[key];
        out[utils.middlelizeKey(key)] = utils.middlelize(v)
      }
      return out;
    } else {
      return obj;
    }
  }

  /**
   * 将key字符串转换成驼峰方式命名（如 "someName"） 的字符串
   * @param key string类型
   * @param separators key分隔符 "-"中划线/"_"下划线
   */
  export function camelizeKey(key: string, separators: string[] = ["-", "_"]): string {
    let out: any = [];
    let i: number = 0;
    let separatorsSet = new Set(separators);
    while (i < key.length) {
      if (separatorsSet.has(key[i])) {
        out.push(key[i + 1].toUpperCase());
        i++;
      } else {
        out.push(key[i]);
      }
      i++;
    }
    return out.join("");
  }

  /**
   * 将对象键值对中的 key 转换为按照驼峰方式命名的 key
   * @param obj
   */
  export function camelize(obj: object): { [key: string]: any } {
    if (obj === null || obj === undefined) {
      return null;
    } else if (obj instanceof Array) {
      return obj.map((item) => {
        return utils.camelize(item);
      })
    } else if (typeof obj === "object") {
      let out: any = {};
      for (let key in (obj as any)) {
        let v = (obj as any)[key]
        out[utils.camelizeKey(key)] = utils.camelize(v);
      }
      return out;
    } else {
      return obj;
    }
  }

  /**
   *将一个时间对象和时间戳转换成对应的时间格式
   * @param time 时间对象和时间戳
   * @param format 时间格式, 参数：y年m月d日h点i分s秒c毫秒，w=weekDay，YMD分别是年月日的简写，
   */
  export function parseTime(time: Date | number, format = "Y年M月D日h点i分"): string {
    // keys = "Y","M","D","d","h","m","s","c"
    if (!time) return "";
    if (typeof time === "number") {
      time = utils.normalizeTime(time);
    }
    let arr: any = format.split("");
    let date: Date;
    if (time instanceof Date) {
      date = time;
    } else {
      date = new Date(time);
    }
    for (let index = 0; index < arr.length; index++) {
      let value = arr[index]
      switch (value) {
        case "Y": arr[index] = date.getFullYear() - 2000; break;
        case "M": arr[index] = date.getMonth() + 1; break;
        case "D": arr[index] = date.getDate(); break;
        case "y": arr[index] = date.getFullYear(); break;
        case "m":
          let m: number = date.getMonth() + 1;
          arr[index] = m < 10 ? `0${m}` : m.toString();
          break;
        case "d":
          let d: number = date.getDate();
          arr[index] = d < 10 ? `0${d}` : d.toString();
          break;
        case "w":
          let w: number = date.getDay();
          switch (w) {
            case 1: arr[index] = "一"; break;
            case 2: arr[index] = "二"; break;
            case 3: arr[index] = "三"; break;
            case 4: arr[index] = "四"; break;
            case 5: arr[index] = "五"; break;
            case 6: arr[index] = "六"; break;
            case 0: arr[index] = "日"; break;
          };
          break;
        case "h":
          arr[index] = date.getHours().toString();
          while (arr[index].length < 2) {
            arr[index] = "0" + arr[index];
          }
          break;
        case "i":
          arr[index] = date.getMinutes().toString();
          while (arr[index].length < 2) {
            arr[index] = "0" + arr[index];
          }
          break;
        case "s":
          arr[index] = date.getSeconds().toString();
          while (arr[index].length < 2) {
            arr[index] = "0" + arr[index];
          }
          break;
        case "c":
          arr[index] = date.getMilliseconds().toString();
          while (arr[index].length < 3) {
            arr[index] = "0" + arr[index];
          }
          break;
      }
    }
    return arr.join("");
  }

  /**
   * 将指定时间戳转换成类似 ”5分钟前“ 这样的形式
   * @param time unix时间戳或Date对象，如果传入时间戳可以m秒为单位，或者毫秒为单位
   * @param detailed 输出简略格式或者详细格式，默认简略
   */
  export function timeFromNow(time: Date | number, detailed: boolean = false): string {
    let dateTime: Date;
    if (time instanceof Date) {
      dateTime = time;
    } else {
      dateTime = new Date(utils.normalizeTime(time));
    }
    let now = new Date().getTime();
    let d = now - dateTime.getTime();
    let thatday = utils.parseTime(dateTime, "YMD");
    let today = utils.parseTime(now, "YMD");
    let yesterday = utils.parseTime(now - 24 * 3600 * 1000, "YMD");
    if (dateTime.getFullYear() !== new Date().getFullYear()) {
      // 不是今年
      if (detailed) {
        return utils.parseTime(dateTime, "Y-M-D h:i");
      } else {
        return utils.parseTime(dateTime, "M月D日");
      }
    }
    if (thatday !== today && thatday !== yesterday) {
      // 昨天以前
      if (detailed) {
        return utils.parseTime(dateTime, "Y-M-D h:i");
      } else {
        return utils.parseTime(dateTime, "M月D日");
      }
    }
    if (thatday === yesterday) {
      return `昨天${utils.parseTime(dateTime, "h:i")}`;
    }
    if (d > 3600 * 1000) {
      return `${Math.floor(d / 1000 / 60 / 60)}小时前`;
    }
    if (d > 60 * 1000) {
      return `${Math.floor(d / 1000 / 60)}分钟前`;
    }
    return "刚刚";
  }

  /**
   * 用于统一毫秒单位时间戳和秒单位时间戳
   * @param time 时间戳
   * @param toSecond 最终计算出来是否以秒为单位
   */
  export function normalizeTime(time: number, toSecond: boolean = false): number {
    time = time * 1;
    if (toSecond) {
      if (time > (new Date("3000-01-01").getTime() / 1000)) {
        time = time / 1000
      }
    } else {
      if (time < (new Date("1971-01-01").getTime())) {
        time = time * 1000
      }
    }
    return time;
  }

  /**
   * 生成随机字符串
  */
  export function genSessionId(): string {
    return Date.now().toString(36) + parseInt(Math.random() * 100000 + "").toString(36)
  }

  /**
   * base64格式转二进制对象
   * @param base64 base64格式的string
   * @param contentType 内容
   * @param sliceSize 截取大小
   */
  export function base64ToBlob(base64: string, contentType: string = '', sliceSize: number = 512): Blob {
    let byteCharacters = atob(base64);
    let byteArrays = [];
    let offset = 0;
    while (offset < byteCharacters.length) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      let i = 0;
      while (i < slice.length) {
        byteNumbers[i] = slice.charCodeAt(i);
        i++;
      }
      byteArrays.push(new Uint8Array(byteNumbers));
      offset += sliceSize;
    }
    let blob = new Blob(byteArrays, {
      type: contentType
    });
    return blob;
  }

  /**
   * 获得 chrome 内核版本
   */
  export function getChromeVersion(): number {
    return parseInt(/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]);
  }


  /**
   * 或操作，类似操作符 “||” ，但是只有 null 和 undefin 的时候会命中， 0 或 false 时不会
   */
  export function or<T>(value1: T, value2: T): T {
    return (value1 !== undefined && value1 !== null) ? value1 : value2;
  }

  /**
   * 是否为高分辨率
   */
  export function isHighDensity(): boolean {
    return window.devicePixelRatio > 1;
  }

  /**
   * 检查是否需要更新
   * @param currentVersion 当前版本
   * @param remoteVersion  最新版本
   */
  export function checkIfNeedUpdate(currentVersion: string, remoteVersion: string): boolean {
    let [a, b, c] = currentVersion.split(".");
    let [a1, b1, c1] = remoteVersion.split(".");
    let v1 = parseInt(a) * 1000000 + parseInt(b) * 1000 + parseInt(c) * 1;
    let v2 = parseInt(a1) * 1000000 + parseInt(b1) * 1000 + parseInt(c1) * 1;
    if (v2 > v1) {
      return true
    } else {
      return false
    }
  }

  /**
   * 找出给定 html 中所有的 inline script，可以指定过滤用正则表达式
   * @param html 网页html
   * @param match 正则表达式，如果指定，则只会返回命中的script
   */
  export function getInlineScriptFromHtml(html: string, match?: RegExp): string[] {
    let wrap = document.createElement("section");
    wrap.innerHTML = utils.removeRefsFromHtml(html, false);
    let res: string[] = []
    for (let arr = wrap.querySelectorAll("script"), i = 0; i < arr.length; i++) {
      let script = arr[i];
      if (script.src || (script.type && script.type !== "text/javascript")) {
        // 跳过非 js 类型 script，和非 inline 的 script
        continue;
      }
      if (match) {
        if (match.test(script.innerHTML)) {
          res.push(script.innerHTML)
        }
      } else {
        res.push(script.innerHTML);
      }
    }
    return res;
  };

  /**
   * 克隆给定对象
   * @param target 源对象
   * @param deepClone 是否进行深拷贝，如果为 false，只进行一层拷贝，深层都为引用
   */
  export function clone<T>(target: T, deepClone = false): T {
    if (target instanceof Array) {
      let res = [];
      for (let item of target) {
        if (deepClone) {
          res.push(utils.clone(item), deepClone);
        } else {
          res.push(item);
        }
      }
      return res as any;
    } else if (typeof target === "object") {
      let res = {} as any;
      for (let key in target) {
        if (deepClone) {
          res[key] = utils.clone(target[key], deepClone);
        } else {
          res[key] = target[key];
        }
      }
      return res;
    } else {
      return target;
    }
  }

  /**
   * 将键值对转换成列表
   * @param map 键值对map
   */
  export function mapToList<T>(map: { [key: string]: T }): T[] {
    let res: T[] = [];
    for (let key in map) {
      res.push(map[key]);
    }
    return res;
  }

  /**
   * 将列表转换成键值对
   * @param list 列表
   * @param hashKey 哈希字段，会用作 map 的 key
   */
  export function listToMap<T, K extends keyof T>(list: T[], hashKey: K): { [key: string]: T } {
    let map: { [key: string]: T } = {};
    for (let item of list) {
      let hash: string = (item as any)[hashKey];
      if (!hash) {
        console.error(`Can't find key ${hash} in`, item)
      }
      map[hash] = item;
    }
    return map;
  }

  /**
   * 向给定 url 后添加 query 参数
   */
  export function addUrlArgs(url: string, args: { [key: string]: string | number }): string {
    let [baseUrl, hash] = url.split("#")
    let parts: string[] = [];
    for (let k in args) {
      let v = args[k];
      if (v !== undefined && v !== null) {
        parts.push(k + "=" + encodeURIComponent(v.toString()));
      }
    }
    if (baseUrl.indexOf("?") > -1) {
      baseUrl += "&" + parts.join("&");
    } else {
      baseUrl += "?" + parts.join("&");
    }
    if (hash) {
      return baseUrl + "#" + hash;
    } else {
      return baseUrl;
    }
  }

  /**
   * 删除 html string 中的 script 标签，img 和 link
   * @param html html 字符串
   * @param removeScripts 是否去除 script 标签
   */
  export function removeRefsFromHtml(html: string, removeScripts: boolean = false): string {
    html = html.replace(/<img/g, '<noimg').replace(/<link /g, '<nolink ');
    if (removeScripts) {
      html = html.replace(/<(\/?)script/g, "<$1noscript");
    }
    return html;
  }

  /**
   * 构建一个元素容器，并将指定 html 内容放置进去，会调用 removeRefsFromHtml 来去除 html 中的外部引用和 scripts
   * @param html html 字符串
   */
  export function parseHtmlForData(html: string): HTMLElement {
    let wrap = document.createElement("div");
    html = utils.removeRefsFromHtml(html, true);
    html = html.replace(/<(\/?)body/g, "<$1bodydiv");
    html = html.replace(/<(\/?)head/g, "<$1headdiv");
    wrap.innerHTML = html;
    return wrap;
  }

  /**
   * 生成距离现在给定天数时的时间，格式可以通过 format 参数定制，规则与 parseTime 相同
   * @param offset 时间偏移量
   * @param format 时间格式
   */
  export function getTimeByOffset(offset: number, format = "y-m-d"): string {
    let t = Date.now() + offset * (24 * 3600 * 1000)
    return utils.parseTime(t, format)
  }

  type MaxRetryHandler = (error: any) => boolean;
  type RetryUntilResolveRes<T> = {
    handleMaxRetry: (handler: MaxRetryHandler) => RetryUntilResolveRes<T>,
    toPromise: () => Promise<T>
  }
  export function retryUntilResolve<T>(handler: () => Promise<T>, retryLimit: number): RetryUntilResolveRes<T> {
    let retryCount = 0;
    let maxRetryHandler: MaxRetryHandler;
    let p = new Promise<T>(function (resolve, reject) {
      function iter() {
        console.log(`call iter, ${retryCount}/${retryLimit}`);
        p = handler();
        if (!(p instanceof Promise)) {
          console.error("utils.retryUntilResolve only accept handler that return Promise instance")
          reject();
        }
        p.then(function (data) { resolve(data); })
        p.catch(function (e) {
          if (e === true) {
            // 上级handler使用reject(true)可以阻止默认重试行为
            return reject({ userAbort: true });
          }
          if (retryCount < retryLimit) {
            retryCount += 1;
            return iter();
          }
          // TODO consider support async handler
          if (maxRetryHandler && maxRetryHandler(e) === true) {
            // 如果 maxRetryHandler 返回 true，则重新尝试
            retryCount += 0;
            return iter();
          }
          reject({ userAbort: false });
        });
      }
      iter();
    })
    let res: RetryUntilResolveRes<T> = {
      handleMaxRetry: function (handler: MaxRetryHandler): RetryUntilResolveRes<T> {
        maxRetryHandler = handler
        return res;
      },
      toPromise: function (): Promise<T> {
        return p;
      }
    }
    return res;
  }

  export function forEachElement<T extends Node>(list: NodeListOf<T>, handler: (item: T, idx: number) => void) {
    for (let arr = list, i = 0; i < arr.length; i++) {
      let el = arr[i]
      handler(el, i);
    }
  }

  export function unicodeToChar(text: string) {
    return text.replace(/\\u[\dA-F]{4}/gi, function (match) {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
  }

  export function alert(content: string, title = "提示") {
    let onAccept: () => void = null;
    wx.showModal({
      title, content, showCancel: false,
      success: () => {
        onAccept && onAccept();
      }
    })
    return {
      accept(cb: () => void) {
        onAccept = cb
      }
    }
  }

  export function confirm(content: string, title = "提示") {
    let onAccept: () => void = null;
    let onCancel: () => void = null;
    wx.showModal({
      title, content, showCancel: true,
      success: ({ confirm }) => {
        if (confirm) {
          onAccept && onAccept();
        } else {
          onCancel && onCancel();
        }
      }
    })
    let chain = {
      accept(cb: () => void) {
        onAccept = cb;
        return chain;
      },
      cancel(cb: () => void) {
        onCancel = cb;
        return chain;
      }
    }
    return chain;
  }

  export function showLoadingToast(title: string = "请求中", mask: boolean = true) {
    try {
      wx.showLoading({ title, mask });
    } catch (error) {
      console.error("unable to call wx.showLoading")
    }
  }

  export function hideLoadingToast() {
    try {
      wx.hideLoading();
    } catch (error) {
      console.error("unable to call wx.hideLoading")
    }
  }

  export function showSuccessToast(title: string = "操作成功", duration = 1500) {
    wx.showToast({ title, duration, icon: "success", mask: true });
  }

  export function showFailToast(title: string = "操作失败", duration = 1500) {
    wx.showToast({ title, duration, image: "../imgs/toast-fail.png", mask: true });
  }

  export function showHintToast(title: string = "提示", duration = 1500) {
    wx.showToast({ title, duration, image: "../imgs/toast-hint.png", mask: true });
  }

  export function replaceStatus(url: string) {
    history.replaceState({}, "", url);
  }

  export function isAndroid(): boolean {
    if (window.navigator.userAgent.indexOf("Android") > -1) {
      return true;
    } else {
      return false;
    }
  }

  /** 跳转到指定小程序页面，参数规范符合 pages.d.ts 的定义 */
  export function jump<N extends keyof PageOptions>(pageName: N) {
    return {
      navigate: (options: PageOptions[N]) => {
        let url = utils.genApiUrl(pageName, options as any || {});
        console.log(`navigating to ${url} ...`);
        wx.navigateTo({ url })
      },
      redirect: (options: PageOptions[N]) => {
        let url = utils.genApiUrl(pageName, options as any || {});
        console.log(`redirecting to ${url} ...`);
        wx.redirectTo({ url })
      },
      getUrl: (options: PageOptions[N]) => {
        return utils.genApiUrl(pageName, options as any || {});
      },
      switchTab: () => {
        console.log(`switch to tab ${pageName} ...`);
        wx.switchTab({ url: pageName })
      },
      navigateBack: (delta: number = 1) => {
        console.log(`navigateBack ...`);
        wx.navigateBack({ delta });
      },
      /** 关闭所有页面，打开到应用内的某个页面 */
      reLaunch: (options: PageOptions[N]) => {
        let url = utils.genApiUrl(pageName, options as any || {});
        console.log(`reLaunch to ${url} ...`);
        wx.reLaunch({ url });
      }
    }
  }

  /** 将服务器价格转换为显示价格 */
  export function parseCurrency(serverPrice: number): string {
    if (!serverPrice && serverPrice !== 0) {
      return "";
    }
    if (serverPrice % 100 === 0) {
      return (serverPrice / 100).toFixed(0);
    } else if (serverPrice % 10 === 0) {
      return (serverPrice / 100).toFixed(1);
    } else {
      return (serverPrice / 100).toFixed(2);
    }
  }

  export function genArray<T=number>(n: number, valueMaker?: (i: number) => T): T[] {
    let arr: T[] = [];
    for (let i = 0; i < n; i++) {
      if (valueMaker) {
        arr.push(valueMaker(i));
      } else {
        arr.push(i as any);
      }
    }
    return arr;
  }

  /**
   *
   * @param backgroundColor 导航背景色
   * @param frontColor 前景色 (只支持 黑色#000000 和 白色#ffffff )
   */
  export function setNavigationBarColor(backgroundColor: string, frontColor: string = "#ffffff") {
    wx.setNavigationBarColor({
      backgroundColor,
      frontColor
    })
  }
}

if (window) {
  (window as any).utils = utils;
}
export default utils;

// tests
// console.log(utils.camelize({ "a_a": 1, "b-b_b": { "c_c": 1 } }));
// console.log(utils.parseTime(new Date))