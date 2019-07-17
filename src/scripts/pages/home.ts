import { AppPage, PageBuilder } from '../base/AppPage'

interface PageData {
  hint: string,
}

class HomePage extends AppPage<'home', PageData> {
  public name: 'home' = 'home'


  public initData: Partial<PageData> = {
    hint: 'Hello, World'
  }

  public onLoad(options: this['options']): void {
    // 使用redirectTo是在当前页面打开
    // navigateTo相当于在新窗口打开
    // 如果页面被声明到了tabBar，则必须使用switchTab
    console.log(options);
    console.log('index page', arguments) 

    // let app = this.getApp();
  }

  public onShow() :void{
    console.log('on show');

  }

}

PageBuilder.build(HomePage)
