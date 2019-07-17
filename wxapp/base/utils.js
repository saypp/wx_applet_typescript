"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils;
(function (utils) {
    utils.KEYS = {
        "ENTER": 13,
        "BACKSPACE": 8
    };
    /**
   * 当数值大于1000时，返回以k为单位的字符串
   * @param count number类型
   */
    function genUnit(count) {
        var _count = count.toString();
        if (_count.length > 3) {
            _count = _count.slice(0, _count.length - 3) + 'k';
        }
        return _count;
    }
    utils.genUnit = genUnit;
    /**
     * 获得URL中”？“后面的参数 以键值对的形式放回
     * @param url string类型
     */
    function getUrlArgs(url, camelize) {
        if (url === void 0) { url = window.location.href; }
        if (camelize === void 0) { camelize = false; }
        // remove url hash
        var href = url.split("#")[0];
        var s = href.split("?")[1];
        if (!s) {
            return {};
        }
        var args = {};
        for (var _i = 0, _a = s.split("&"); _i < _a.length; _i++) {
            var a = _a[_i];
            var part = a.split("=");
            var s_1 = void 0;
            try {
                s_1 = decodeURIComponent(part[1]);
            }
            catch (error) {
                s_1 = part[1];
            }
            args[part[0]] = s_1;
        }
        if (camelize) {
            args = utils.camelize(args);
        }
        return args;
    }
    utils.getUrlArgs = getUrlArgs;
    /**
     * 生成URL链接
     * @param path URL中的路径
     * @param queryArgs URL中 “?” 后面的参数
     */
    function genApiUrl(path, queryArgs) {
        if (!queryArgs) {
            queryArgs = {};
        }
        var args = [];
        for (var key in queryArgs) {
            var v = queryArgs[key];
            if (v !== null) {
                args.push(key + "=" + v);
            }
        }
        if (args.length === 0) {
            return path;
        }
        else {
            return path + "?" + args.join("&");
        }
    }
    utils.genApiUrl = genApiUrl;
    /**
     * 从当前页面的 url hash 中获取所有参数，以键值对形式返回
     */
    function getHashArgs() {
        var hash = window.location.hash;
        if (!hash) {
            return {};
        }
        else {
            return utils.getUrlArgs("?" + hash.slice(1));
        }
    }
    utils.getHashArgs = getHashArgs;
    /**
     * 向当前页面的 url hash 中添加指定参数，会按照 url query 的方式组织
     * @param key 参数名 string
     * @param value 参数值 string | null  为 null 的时候是将哈希 key 和 对应的值  清除
     */
    function setHashArg(key, value) {
        var args = utils.getHashArgs();
        if (value === null) {
            if (args[key]) {
                delete args[key];
            }
            else {
                throw new Error("invalid " + key);
            }
        }
        else {
            args[key] = value;
        }
        window.location.hash = utils.genApiUrl("", args).slice(1);
    }
    utils.setHashArg = setHashArg;
    /**
     * 将key字符串转换成下划线方式命名 (如 "some_name") 的字符串
     * @param key 对象字符串
     * @param ignoreFirst 是否忽略第一个大写字母，如果忽略，会将其当成小写字母处理
     */
    function underlizeKey(key, ignoreFirst) {
        if (ignoreFirst === void 0) { ignoreFirst = false; }
        var out = [];
        var i = 0;
        var lowerCasedStr = key.toString().toLowerCase();
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
    utils.underlizeKey = underlizeKey;
    /**
     * 将对象键值对中的 key 转换为按照下划线方式命名的 key
     * @param obj 需要转换的对象
     */
    function underlize(obj) {
        if (obj === null || obj === undefined) {
            return null;
        }
        else if (obj instanceof Array) {
            return obj.map(function (item) {
                return utils.underlize(item);
            });
        }
        else if (typeof obj === "object") {
            var out = {};
            for (var key in obj) {
                var v = obj[key];
                out[utils.underlizeKey(key)] = utils.underlize(v);
            }
            return out;
        }
        else {
            return obj;
        }
    }
    utils.underlize = underlize;
    /**
     * 将key字符串转换成中划线方式命名 (如 "some-name") 的字符串
     * @param key 对象字符串
     * @param ignoreFirst 是否忽略第一个大写字母，如果忽略，会将其当成小写字母处理
     */
    function middlelizeKey(key, ignoreFirst) {
        if (ignoreFirst === void 0) { ignoreFirst = false; }
        var out = [];
        var i = 0;
        var lowerCasedStr = key.toString().toLowerCase();
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
    utils.middlelizeKey = middlelizeKey;
    /**
     * 将对象键值对中的 key 转换为按照下划线方式命名的 key
     * @param obj 需要转换的对象
     */
    function middlelize(obj) {
        if (obj === null || obj === undefined) {
            return null;
        }
        else if (obj instanceof Array) {
            return obj.map(function (item) {
                return utils.underlize(item);
            });
        }
        else if (typeof obj === "object") {
            var out = {};
            for (var key in obj) {
                var v = obj[key];
                out[utils.middlelizeKey(key)] = utils.middlelize(v);
            }
            return out;
        }
        else {
            return obj;
        }
    }
    utils.middlelize = middlelize;
    /**
     * 将key字符串转换成驼峰方式命名（如 "someName"） 的字符串
     * @param key string类型
     * @param separators key分隔符 "-"中划线/"_"下划线
     */
    function camelizeKey(key, separators) {
        if (separators === void 0) { separators = ["-", "_"]; }
        var out = [];
        var i = 0;
        var separatorsSet = new Set(separators);
        while (i < key.length) {
            if (separatorsSet.has(key[i])) {
                out.push(key[i + 1].toUpperCase());
                i++;
            }
            else {
                out.push(key[i]);
            }
            i++;
        }
        return out.join("");
    }
    utils.camelizeKey = camelizeKey;
    /**
     * 将对象键值对中的 key 转换为按照驼峰方式命名的 key
     * @param obj
     */
    function camelize(obj) {
        if (obj === null || obj === undefined) {
            return null;
        }
        else if (obj instanceof Array) {
            return obj.map(function (item) {
                return utils.camelize(item);
            });
        }
        else if (typeof obj === "object") {
            var out = {};
            for (var key in obj) {
                var v = obj[key];
                out[utils.camelizeKey(key)] = utils.camelize(v);
            }
            return out;
        }
        else {
            return obj;
        }
    }
    utils.camelize = camelize;
    /**
     *将一个时间对象和时间戳转换成对应的时间格式
     * @param time 时间对象和时间戳
     * @param format 时间格式, 参数：y年m月d日h点i分s秒c毫秒，w=weekDay，YMD分别是年月日的简写，
     */
    function parseTime(time, format) {
        if (format === void 0) { format = "Y年M月D日h点i分"; }
        // keys = "Y","M","D","d","h","m","s","c"
        if (!time)
            return "";
        if (typeof time === "number") {
            time = utils.normalizeTime(time);
        }
        var arr = format.split("");
        var date;
        if (time instanceof Date) {
            date = time;
        }
        else {
            date = new Date(time);
        }
        for (var index = 0; index < arr.length; index++) {
            var value = arr[index];
            switch (value) {
                case "Y":
                    arr[index] = date.getFullYear() - 2000;
                    break;
                case "M":
                    arr[index] = date.getMonth() + 1;
                    break;
                case "D":
                    arr[index] = date.getDate();
                    break;
                case "y":
                    arr[index] = date.getFullYear();
                    break;
                case "m":
                    var m = date.getMonth() + 1;
                    arr[index] = m < 10 ? "0" + m : m.toString();
                    break;
                case "d":
                    var d = date.getDate();
                    arr[index] = d < 10 ? "0" + d : d.toString();
                    break;
                case "w":
                    var w = date.getDay();
                    switch (w) {
                        case 1:
                            arr[index] = "一";
                            break;
                        case 2:
                            arr[index] = "二";
                            break;
                        case 3:
                            arr[index] = "三";
                            break;
                        case 4:
                            arr[index] = "四";
                            break;
                        case 5:
                            arr[index] = "五";
                            break;
                        case 6:
                            arr[index] = "六";
                            break;
                        case 0:
                            arr[index] = "日";
                            break;
                    }
                    ;
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
    utils.parseTime = parseTime;
    /**
     * 将指定时间戳转换成类似 ”5分钟前“ 这样的形式
     * @param time unix时间戳或Date对象，如果传入时间戳可以m秒为单位，或者毫秒为单位
     * @param detailed 输出简略格式或者详细格式，默认简略
     */
    function timeFromNow(time, detailed) {
        if (detailed === void 0) { detailed = false; }
        var dateTime;
        if (time instanceof Date) {
            dateTime = time;
        }
        else {
            dateTime = new Date(utils.normalizeTime(time));
        }
        var now = new Date().getTime();
        var d = now - dateTime.getTime();
        var thatday = utils.parseTime(dateTime, "YMD");
        var today = utils.parseTime(now, "YMD");
        var yesterday = utils.parseTime(now - 24 * 3600 * 1000, "YMD");
        if (dateTime.getFullYear() !== new Date().getFullYear()) {
            // 不是今年
            if (detailed) {
                return utils.parseTime(dateTime, "Y-M-D h:i");
            }
            else {
                return utils.parseTime(dateTime, "M月D日");
            }
        }
        if (thatday !== today && thatday !== yesterday) {
            // 昨天以前
            if (detailed) {
                return utils.parseTime(dateTime, "Y-M-D h:i");
            }
            else {
                return utils.parseTime(dateTime, "M月D日");
            }
        }
        if (thatday === yesterday) {
            return "\u6628\u5929" + utils.parseTime(dateTime, "h:i");
        }
        if (d > 3600 * 1000) {
            return Math.floor(d / 1000 / 60 / 60) + "\u5C0F\u65F6\u524D";
        }
        if (d > 60 * 1000) {
            return Math.floor(d / 1000 / 60) + "\u5206\u949F\u524D";
        }
        return "刚刚";
    }
    utils.timeFromNow = timeFromNow;
    /**
     * 用于统一毫秒单位时间戳和秒单位时间戳
     * @param time 时间戳
     * @param toSecond 最终计算出来是否以秒为单位
     */
    function normalizeTime(time, toSecond) {
        if (toSecond === void 0) { toSecond = false; }
        time = time * 1;
        if (toSecond) {
            if (time > (new Date("3000-01-01").getTime() / 1000)) {
                time = time / 1000;
            }
        }
        else {
            if (time < (new Date("1971-01-01").getTime())) {
                time = time * 1000;
            }
        }
        return time;
    }
    utils.normalizeTime = normalizeTime;
    /**
     * 生成随机字符串
    */
    function genSessionId() {
        return Date.now().toString(36) + parseInt(Math.random() * 100000 + "").toString(36);
    }
    utils.genSessionId = genSessionId;
    /**
     * base64格式转二进制对象
     * @param base64 base64格式的string
     * @param contentType 内容
     * @param sliceSize 截取大小
     */
    function base64ToBlob(base64, contentType, sliceSize) {
        if (contentType === void 0) { contentType = ''; }
        if (sliceSize === void 0) { sliceSize = 512; }
        var byteCharacters = atob(base64);
        var byteArrays = [];
        var offset = 0;
        while (offset < byteCharacters.length) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            var i = 0;
            while (i < slice.length) {
                byteNumbers[i] = slice.charCodeAt(i);
                i++;
            }
            byteArrays.push(new Uint8Array(byteNumbers));
            offset += sliceSize;
        }
        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }
    utils.base64ToBlob = base64ToBlob;
    /**
     * 获得 chrome 内核版本
     */
    function getChromeVersion() {
        return parseInt(/Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1]);
    }
    utils.getChromeVersion = getChromeVersion;
    /**
     * 或操作，类似操作符 “||” ，但是只有 null 和 undefin 的时候会命中， 0 或 false 时不会
     */
    function or(value1, value2) {
        return (value1 !== undefined && value1 !== null) ? value1 : value2;
    }
    utils.or = or;
    /**
     * 是否为高分辨率
     */
    function isHighDensity() {
        return window.devicePixelRatio > 1;
    }
    utils.isHighDensity = isHighDensity;
    /**
     * 检查是否需要更新
     * @param currentVersion 当前版本
     * @param remoteVersion  最新版本
     */
    function checkIfNeedUpdate(currentVersion, remoteVersion) {
        var _a = currentVersion.split("."), a = _a[0], b = _a[1], c = _a[2];
        var _b = remoteVersion.split("."), a1 = _b[0], b1 = _b[1], c1 = _b[2];
        var v1 = parseInt(a) * 1000000 + parseInt(b) * 1000 + parseInt(c) * 1;
        var v2 = parseInt(a1) * 1000000 + parseInt(b1) * 1000 + parseInt(c1) * 1;
        if (v2 > v1) {
            return true;
        }
        else {
            return false;
        }
    }
    utils.checkIfNeedUpdate = checkIfNeedUpdate;
    /**
     * 找出给定 html 中所有的 inline script，可以指定过滤用正则表达式
     * @param html 网页html
     * @param match 正则表达式，如果指定，则只会返回命中的script
     */
    function getInlineScriptFromHtml(html, match) {
        var wrap = document.createElement("section");
        wrap.innerHTML = utils.removeRefsFromHtml(html, false);
        var res = [];
        for (var arr = wrap.querySelectorAll("script"), i = 0; i < arr.length; i++) {
            var script = arr[i];
            if (script.src || (script.type && script.type !== "text/javascript")) {
                // 跳过非 js 类型 script，和非 inline 的 script
                continue;
            }
            if (match) {
                if (match.test(script.innerHTML)) {
                    res.push(script.innerHTML);
                }
            }
            else {
                res.push(script.innerHTML);
            }
        }
        return res;
    }
    utils.getInlineScriptFromHtml = getInlineScriptFromHtml;
    ;
    /**
     * 克隆给定对象
     * @param target 源对象
     * @param deepClone 是否进行深拷贝，如果为 false，只进行一层拷贝，深层都为引用
     */
    function clone(target, deepClone) {
        if (deepClone === void 0) { deepClone = false; }
        if (target instanceof Array) {
            var res = [];
            for (var _i = 0, target_1 = target; _i < target_1.length; _i++) {
                var item = target_1[_i];
                if (deepClone) {
                    res.push(utils.clone(item), deepClone);
                }
                else {
                    res.push(item);
                }
            }
            return res;
        }
        else if (typeof target === "object") {
            var res = {};
            for (var key in target) {
                if (deepClone) {
                    res[key] = utils.clone(target[key], deepClone);
                }
                else {
                    res[key] = target[key];
                }
            }
            return res;
        }
        else {
            return target;
        }
    }
    utils.clone = clone;
    /**
     * 将键值对转换成列表
     * @param map 键值对map
     */
    function mapToList(map) {
        var res = [];
        for (var key in map) {
            res.push(map[key]);
        }
        return res;
    }
    utils.mapToList = mapToList;
    /**
     * 将列表转换成键值对
     * @param list 列表
     * @param hashKey 哈希字段，会用作 map 的 key
     */
    function listToMap(list, hashKey) {
        var map = {};
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var item = list_1[_i];
            var hash = item[hashKey];
            if (!hash) {
                console.error("Can't find key " + hash + " in", item);
            }
            map[hash] = item;
        }
        return map;
    }
    utils.listToMap = listToMap;
    /**
     * 向给定 url 后添加 query 参数
     */
    function addUrlArgs(url, args) {
        var _a = url.split("#"), baseUrl = _a[0], hash = _a[1];
        var parts = [];
        for (var k in args) {
            var v = args[k];
            if (v !== undefined && v !== null) {
                parts.push(k + "=" + encodeURIComponent(v.toString()));
            }
        }
        if (baseUrl.indexOf("?") > -1) {
            baseUrl += "&" + parts.join("&");
        }
        else {
            baseUrl += "?" + parts.join("&");
        }
        if (hash) {
            return baseUrl + "#" + hash;
        }
        else {
            return baseUrl;
        }
    }
    utils.addUrlArgs = addUrlArgs;
    /**
     * 删除 html string 中的 script 标签，img 和 link
     * @param html html 字符串
     * @param removeScripts 是否去除 script 标签
     */
    function removeRefsFromHtml(html, removeScripts) {
        if (removeScripts === void 0) { removeScripts = false; }
        html = html.replace(/<img/g, '<noimg').replace(/<link /g, '<nolink ');
        if (removeScripts) {
            html = html.replace(/<(\/?)script/g, "<$1noscript");
        }
        return html;
    }
    utils.removeRefsFromHtml = removeRefsFromHtml;
    /**
     * 构建一个元素容器，并将指定 html 内容放置进去，会调用 removeRefsFromHtml 来去除 html 中的外部引用和 scripts
     * @param html html 字符串
     */
    function parseHtmlForData(html) {
        var wrap = document.createElement("div");
        html = utils.removeRefsFromHtml(html, true);
        html = html.replace(/<(\/?)body/g, "<$1bodydiv");
        html = html.replace(/<(\/?)head/g, "<$1headdiv");
        wrap.innerHTML = html;
        return wrap;
    }
    utils.parseHtmlForData = parseHtmlForData;
    /**
     * 生成距离现在给定天数时的时间，格式可以通过 format 参数定制，规则与 parseTime 相同
     * @param offset 时间偏移量
     * @param format 时间格式
     */
    function getTimeByOffset(offset, format) {
        if (format === void 0) { format = "y-m-d"; }
        var t = Date.now() + offset * (24 * 3600 * 1000);
        return utils.parseTime(t, format);
    }
    utils.getTimeByOffset = getTimeByOffset;
    function retryUntilResolve(handler, retryLimit) {
        var retryCount = 0;
        var maxRetryHandler;
        var p = new Promise(function (resolve, reject) {
            function iter() {
                console.log("call iter, " + retryCount + "/" + retryLimit);
                p = handler();
                if (!(p instanceof Promise)) {
                    console.error("utils.retryUntilResolve only accept handler that return Promise instance");
                    reject();
                }
                p.then(function (data) { resolve(data); });
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
        });
        var res = {
            handleMaxRetry: function (handler) {
                maxRetryHandler = handler;
                return res;
            },
            toPromise: function () {
                return p;
            }
        };
        return res;
    }
    utils.retryUntilResolve = retryUntilResolve;
    function forEachElement(list, handler) {
        for (var arr = list, i = 0; i < arr.length; i++) {
            var el = arr[i];
            handler(el, i);
        }
    }
    utils.forEachElement = forEachElement;
    function unicodeToChar(text) {
        return text.replace(/\\u[\dA-F]{4}/gi, function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
    }
    utils.unicodeToChar = unicodeToChar;
    function alert(content, title) {
        if (title === void 0) { title = "提示"; }
        var onAccept = null;
        wx.showModal({
            title: title, content: content, showCancel: false,
            success: function () {
                onAccept && onAccept();
            }
        });
        return {
            accept: function (cb) {
                onAccept = cb;
            }
        };
    }
    utils.alert = alert;
    function confirm(content, title) {
        if (title === void 0) { title = "提示"; }
        var onAccept = null;
        var onCancel = null;
        wx.showModal({
            title: title, content: content, showCancel: true,
            success: function (_a) {
                var confirm = _a.confirm;
                if (confirm) {
                    onAccept && onAccept();
                }
                else {
                    onCancel && onCancel();
                }
            }
        });
        var chain = {
            accept: function (cb) {
                onAccept = cb;
                return chain;
            },
            cancel: function (cb) {
                onCancel = cb;
                return chain;
            }
        };
        return chain;
    }
    utils.confirm = confirm;
    function showLoadingToast(title, mask) {
        if (title === void 0) { title = "请求中"; }
        if (mask === void 0) { mask = true; }
        try {
            wx.showLoading({ title: title, mask: mask });
        }
        catch (error) {
            console.error("unable to call wx.showLoading");
        }
    }
    utils.showLoadingToast = showLoadingToast;
    function hideLoadingToast() {
        try {
            wx.hideLoading();
        }
        catch (error) {
            console.error("unable to call wx.hideLoading");
        }
    }
    utils.hideLoadingToast = hideLoadingToast;
    function showSuccessToast(title, duration) {
        if (title === void 0) { title = "操作成功"; }
        if (duration === void 0) { duration = 1500; }
        wx.showToast({ title: title, duration: duration, icon: "success", mask: true });
    }
    utils.showSuccessToast = showSuccessToast;
    function showFailToast(title, duration) {
        if (title === void 0) { title = "操作失败"; }
        if (duration === void 0) { duration = 1500; }
        wx.showToast({ title: title, duration: duration, image: "../imgs/toast-fail.png", mask: true });
    }
    utils.showFailToast = showFailToast;
    function showHintToast(title, duration) {
        if (title === void 0) { title = "提示"; }
        if (duration === void 0) { duration = 1500; }
        wx.showToast({ title: title, duration: duration, image: "../imgs/toast-hint.png", mask: true });
    }
    utils.showHintToast = showHintToast;
    function replaceStatus(url) {
        history.replaceState({}, "", url);
    }
    utils.replaceStatus = replaceStatus;
    function isAndroid() {
        if (window.navigator.userAgent.indexOf("Android") > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    utils.isAndroid = isAndroid;
    /** 跳转到指定小程序页面，参数规范符合 pages.d.ts 的定义 */
    function jump(pageName) {
        return {
            navigate: function (options) {
                var url = utils.genApiUrl(pageName, options || {});
                console.log("navigating to " + url + " ...");
                wx.navigateTo({ url: url });
            },
            redirect: function (options) {
                var url = utils.genApiUrl(pageName, options || {});
                console.log("redirecting to " + url + " ...");
                wx.redirectTo({ url: url });
            },
            getUrl: function (options) {
                return utils.genApiUrl(pageName, options || {});
            },
            switchTab: function () {
                console.log("switch to tab " + pageName + " ...");
                wx.switchTab({ url: pageName });
            },
            navigateBack: function (delta) {
                if (delta === void 0) { delta = 1; }
                console.log("navigateBack ...");
                wx.navigateBack({ delta: delta });
            },
            /** 关闭所有页面，打开到应用内的某个页面 */
            reLaunch: function (options) {
                var url = utils.genApiUrl(pageName, options || {});
                console.log("reLaunch to " + url + " ...");
                wx.reLaunch({ url: url });
            }
        };
    }
    utils.jump = jump;
    /** 将服务器价格转换为显示价格 */
    function parseCurrency(serverPrice) {
        if (!serverPrice && serverPrice !== 0) {
            return "";
        }
        if (serverPrice % 100 === 0) {
            return (serverPrice / 100).toFixed(0);
        }
        else if (serverPrice % 10 === 0) {
            return (serverPrice / 100).toFixed(1);
        }
        else {
            return (serverPrice / 100).toFixed(2);
        }
    }
    utils.parseCurrency = parseCurrency;
    function genArray(n, valueMaker) {
        var arr = [];
        for (var i = 0; i < n; i++) {
            if (valueMaker) {
                arr.push(valueMaker(i));
            }
            else {
                arr.push(i);
            }
        }
        return arr;
    }
    utils.genArray = genArray;
    /**
     *
     * @param backgroundColor 导航背景色
     * @param frontColor 前景色 (只支持 黑色#000000 和 白色#ffffff )
     */
    function setNavigationBarColor(backgroundColor, frontColor) {
        if (frontColor === void 0) { frontColor = "#ffffff"; }
        wx.setNavigationBarColor({
            backgroundColor: backgroundColor,
            frontColor: frontColor
        });
    }
    utils.setNavigationBarColor = setNavigationBarColor;
})(utils = exports.utils || (exports.utils = {}));
if (window) {
    window.utils = utils;
}
exports.default = utils;
// tests
// console.log(utils.camelize({ "a_a": 1, "b-b_b": { "c_c": 1 } }));
// console.log(utils.parseTime(new Date))
