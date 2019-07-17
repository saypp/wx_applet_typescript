import { GlobalContext } from "../app";
import { configs } from "./configs";

interface PageInitData<D> extends wx.PageOptions {
  data: D,
}

const defaultPageMembers = ["setData", "data"];

export class PageBuilder {
  public static build<P extends Constructor<AppPage<any, any>>>(PageClass: P) {
    let page = new PageClass();
    let pageOptions: PageInitData<AppPage<any, any>["data"]> = {
      data: {
        ...page.initData,
        assetsDir: configs.assetsDir,
        templateDatas: {
          assetsDir: configs.assetsDir
        }
      },
      onLoad: function (params) {
        page.options = params;
        page.setWechatContext(this);
        page.onLoad(params);
      },
      onReady: page.onReady.bind(page),
      onShow: page.onShow.bind(page),
      onHide: page.onHide.bind(page),
      onUnload: page.onUnload.bind(page)
    }
    for (let key in page) {
      if (typeof (page as any)[key] === "function" && !pageOptions[key]) {
        let shouldIgnore = false;
        for (let name of defaultPageMembers) {
          if (key === name) {
            shouldIgnore = true;
            break;
          }
        }
        if (shouldIgnore) {
          continue;
        }
        pageOptions[key] = ((page as any)[key] as Function).bind(page);
      }
    }
    console.log("pageOptions:", pageOptions)
    Page(pageOptions);
  }
}

export abstract class AppPage<N extends keyof PageOptions, D> {
  abstract name: N;
  abstract initData: Partial<D>;
  options: PageOptions[N];
  private wechatContext: Page = null;
  public data: D = {} as D;

  /** 生命周期函数--监听页面加载 */
  public abstract onLoad(options: this["options"]): void;

  /** 生命周期函数--监听页面渲染完成 */
  public onReady(): wx.NoneParamCallback | void { };

  /** 生命周期函数--监听页面显示 */
  public onShow(): wx.NoneParamCallback | void { };

  /** 生命周期函数--监听页面隐藏 */
  public onHide(): wx.NoneParamCallback | void { };

  /** 生命周期函数--监听页面卸载 */
  public onUnload(): wx.NoneParamCallback | void { };

  public setData(data: Partial<D>, callback?: () => void) {
    // console.log("calling set data", data);
    for (let k in data) {
      this.data[k] = data[k];
    }
    this.wechatContext.setData(data, callback);
  }

  public setWechatContext(context: any) {
    this.wechatContext = context;
    this.data = context.data;
  }

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

  protected getApp(): GlobalContext {
    return getApp() as any;
  }

}
