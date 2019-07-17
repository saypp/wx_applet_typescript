"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AppPage_1 = require("../base/AppPage");
var HomePage = /** @class */ (function (_super) {
    __extends(HomePage, _super);
    function HomePage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'home';
        _this.initData = {
            hint: 'Hello, World'
        };
        return _this;
    }
    HomePage.prototype.onLoad = function (options) {
        // 使用redirectTo是在当前页面打开
        // navigateTo相当于在新窗口打开
        // 如果页面被声明到了tabBar，则必须使用switchTab
        console.log(options);
        console.log('index page', arguments);
        // let app = this.getApp();
    };
    HomePage.prototype.onShow = function () {
        console.log('on show');
    };
    return HomePage;
}(AppPage_1.AppPage));
AppPage_1.PageBuilder.build(HomePage);
