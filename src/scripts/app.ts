import { configs } from "./base/configs";
import { ApiProxy } from "./base/ApiProxy";
import { api } from "./base/api";
import { utils } from "./base/utils";
import { storage } from "./helpers/storage";

let app: typeof appContext = null;

ApiProxy.host = configs.apiHost;
// ApiProxy.basePath = "/api";
ApiProxy.basePath = "";
ApiProxy.authErrorHandler = () => {
  app.logout(() => {
    utils.jump("home").redirect(null);
  });
}

interface GlobalData {
  user: Models.User,
}

let globalData: GlobalData = {
  user: null,
};

let appContext = {
  globalData: globalData,

  init(inviterOpenid: string, userOpenid: string, inviterToken: string, callback: () => void) {
    storage.get(["user"], ({ user }) => {
      console.log("user data in stroage", user);
      if (!user) {
        user = {} as typeof user;
      }
      if (configs.debugUserToken) {
        user.token = configs.debugUserToken;
      }
      if (configs.debugUserOpenid) {
        user.openid = configs.debugUserOpenid;
      }
      this.globalData.user = user;
      ApiProxy.accessToken = user.token;
      this.login(inviterOpenid, userOpenid, inviterToken, () => { callback() }, configs.forceLogin || false)
    })
  },

  login(inviterOpenid: string, userOpenid: string, inviterToken: string, callback: () => void, force = true, allowAbort = false) {
    // 调用微信登录接口
    if (globalData.user && globalData.user.openid && !force) {
      console.log("** skip register for user data exists");
      if (configs.skipAuthCheck) {
        return callback();
      }
      // 在页面载入的时候就下载分享的图片
      // NOTE: 为了性能考虑，现在没有登录环节，只有注册环节
      callback();
      // api.getMe().success(() => {
      //   callback();
      // }).error((msg, code) => {
      //   if (code == 403) {
      //     this.logout()
      //     setTimeout(() => {
      //       // TODO: 需要处理index的options
      //       utils.jump("index").redirect(null);
      //     }, 1000);
      //     return true;
      //   }
      //   return null;
      // })
    } else {
      if (configs.skipAuthCheck) {
        callback();
        return;
      }
      console.error("** do login");
      wx.login({
        success: ({ code, errMsg }) => {
          if (code) {
            wx.getUserInfo({
              success: ({ userInfo, iv, encryptedData }) => {
                api.wxappAuth(code, userInfo, iv, encryptedData, inviterOpenid, userOpenid, inviterToken).success(({ user }) => {
                  globalData.user = user;
                  console.log(user);
                  ApiProxy.accessToken = user.token;
                  storage.set({ user }, callback);
                }).failOrError(() => {
                  console.log("enter, fail");
                  setTimeout(() => {
                    this.login(inviterOpenid, userOpenid, inviterToken, callback);
                  }, 1000)
                })
              },
              fail: (res) => {
                console.error(`get user info data error, :${errMsg}`);
                utils.showHintToast("用户权限认证");
                setTimeout(() => {
                  this.manualAuth(() => {
                    this.login(inviterOpenid, userOpenid, inviterToken, callback);
                  })
                }, 200);
              }
            })
          } else {
            console.error(`登录失败, 错误消息:${errMsg}`);
            if (allowAbort) {
              utils.confirm(`你必须登录才可以正常使用百万黄金屋，点击确定重新登录`, "登录失败").accept(() => {
                this.login(inviterOpenid, userOpenid, inviterToken, callback);
              })
            } else {
              utils.alert(`你必须登录才可以正常使用百万黄金屋，点击确定重新登录`, "登录失败").accept(() => {
                this.login(inviterOpenid, userOpenid, inviterToken, callback);
              });
            }
          }
        },
        fail: () => {
          console.error("调用login接口失败");
          if (allowAbort) {
            utils.confirm("无法调用微信登录，点击重试", "登录失败").accept(() => {
              this.login(inviterOpenid, userOpenid, inviterToken, callback);
            })
          } else {
            utils.alert("无法调用微信登录，点击重试", "登录失败").accept(() => {
              this.login(inviterOpenid, userOpenid, inviterToken, callback);
            })
          }
        }
      })
    }
  },

  logout(callback?: () => void) {
    // 此api用于调试，正常逻辑中不会调用
    console.log("logging out");
    globalData.user = null;
    storage.set({ user: null }, callback);
  },

  // 由于微信认证第一次授权失败后，不会进行第二次的认证弹框的提示，这里需要用户手动进行认证
  manualAuth(callback: () => void) {
    wx.openSetting({
      success: ({ authSetting }) => {
        if (authSetting["scope.userInfo"]) {
          callback();
        } else {
          utils.showFailToast("权限认证失败");
        }
      }
    })
  },

  updateGlobalUnreadBadge(callback: (count: number) => void) {
    // api.getNotificationUnreadCount().success(({ count }) => {
    //   this.globalData.globalUnreadBadge = count;
    //   if (callback) {
    //     callback(count);
    //   }
    // })
  },


  // genShareImage(shareBg: string, callback: () => void): void {
  //   let token = globalData.user.token;
  //   let urlBg = shareBg;
  //   let urlQr = `${configs.shareQrApiHost}/user/gen_invite_qr?user_token=${token}`;
  //   // let avatar = this.globalData.user.avatar;
  //   let fn = (url: string) => {
  //     return new Promise<string>((resolve, reject) => {
  //       console.log("do download", url);
  //       this.downloadImageFile(url, resolve, reject);
  //     })
  //   }
  //   Promise.all<string>([fn(urlBg), fn(urlQr)]).then((res) => {
  //     console.log("got share imgComponent files", res);
  //     callback();
  //   }).catch((e) => {
  //     console.error("download share image error");
  //     console.error(e)
  //   });
  // },

  downloadImageFile(url: string, resolve: (tempFilePath: string) => void, reject: (res: any) => void) {
    if (url) {
      wx.downloadFile({
        url: url,
        success: ({ tempFilePath }) => {
          resolve(tempFilePath);
        },
        fail: (res) => {
          reject(res);
        }
      });
    }
  },

}

export type GlobalContext = typeof appContext;

App({
  ...appContext,
  onLaunch() {
    console.log("App launched");
    app = this as any;
  }
})