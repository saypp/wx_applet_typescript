"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var configs_1 = require("./configs");
var defaultPageMembers = ["setData", "data"];
var PageBuilder = /** @class */ (function () {
    function PageBuilder() {
    }
    PageBuilder.build = function (PageClass) {
        var page = new PageClass();
        var pageOptions = {
            data: __assign({}, page.initData, { assetsDir: configs_1.configs.assetsDir, templateDatas: {
                    assetsDir: configs_1.configs.assetsDir
                } }),
            onLoad: function (params) {
                page.options = params;
                page.setWechatContext(this);
                page.onLoad(params);
            },
            onReady: page.onReady.bind(page),
            onShow: page.onShow.bind(page),
            onHide: page.onHide.bind(page),
            onUnload: page.onUnload.bind(page)
        };
        for (var key in page) {
            if (typeof page[key] === "function" && !pageOptions[key]) {
                var shouldIgnore = false;
                for (var _i = 0, defaultPageMembers_1 = defaultPageMembers; _i < defaultPageMembers_1.length; _i++) {
                    var name_1 = defaultPageMembers_1[_i];
                    if (key === name_1) {
                        shouldIgnore = true;
                        break;
                    }
                }
                if (shouldIgnore) {
                    continue;
                }
                pageOptions[key] = page[key].bind(page);
            }
        }
        console.log("pageOptions:", pageOptions);
        Page(pageOptions);
    };
    return PageBuilder;
}());
exports.PageBuilder = PageBuilder;
var AppPage = /** @class */ (function () {
    function AppPage() {
        this.wechatContext = null;
        this.data = {};
    }
    /** 生命周期函数--监听页面渲染完成 */
    AppPage.prototype.onReady = function () { };
    ;
    /** 生命周期函数--监听页面显示 */
    AppPage.prototype.onShow = function () { };
    ;
    /** 生命周期函数--监听页面隐藏 */
    AppPage.prototype.onHide = function () { };
    ;
    /** 生命周期函数--监听页面卸载 */
    AppPage.prototype.onUnload = function () { };
    ;
    AppPage.prototype.setData = function (data, callback) {
        // console.log("calling set data", data);
        for (var k in data) {
            this.data[k] = data[k];
        }
        this.wechatContext.setData(data, callback);
    };
    AppPage.prototype.setWechatContext = function (context) {
        this.wechatContext = context;
        this.data = context.data;
    };
    // updateGlobalUnreadBadge() {
    //   let app = this.getApp();
    //   let { globalUnreadBadge } = app.globalData;
    //   this.wechatContext.setData({
    //     globalUnreadBadge
    //   })
    //   app.updateGlobalUnreadBadge((globalUnreadBadge) => {
    //     this.wechatContext.setData({
    //       globalUnreadBadge
    //     })
    //   })
    // }
    AppPage.prototype.getApp = function () {
        return getApp();
    };
    return AppPage;
}());
exports.AppPage = AppPage;
