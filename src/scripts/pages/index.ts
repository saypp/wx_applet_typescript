import { AppPage, PageBuilder } from '../base/AppPage'

interface PageData {
  hint: string,
  inputValue: any,
  items:any[],
  array:any[],
  objectArray:any[],
  index: Number,
  multiArray: any[],
  objectMultiArray: any[],
  multiIndex: Number[],
  date: String,
  time: String,
  region: String[],
  customItem: String
}


class IndexPage extends AppPage<'home', PageData> {

  public name: 'home' = 'home'

  public initData: Partial<PageData> = {  
    hint: 'index',
    inputValue: '',
    items: [
      {name: 'USA', value: '美国'},
      {name: 'CHN', value: '中国', checked: 'true'},
      {name: 'JPN', value: '日本'}
    ],
    array: ['美国', '中国', '巴西', '日本'],
    objectArray: [
      {id:0, name:'美国'},
      {id:1, name:'中国'},
      {id:2, name:'巴西'},
      {id:3, name:'日本'}
    ],
    index: 0,
    multiArray: [['无脊椎动物', '脊椎动物'], ['扁形动物', '线形动物', '环节动物', '软体动物', '节肢动物'], ['鼻涕虫', '吸血虫']],
    objectMultiArray: [
      [{id:0, name:'无脊椎动物'},{id:1, name:'脊椎动物'}],
      [{id:0, name:'扁形动物'},{id:1, name:'线形动物'},{id:2, name:'环节动物'},{id:3, name:'软体动物'},{id:4, name:'节肢动物'}],
      [{id:0, name:'鼻涕虫'},{id:1, name:'吸血虫'}]
    ],
    multiIndex: [0, 0, 0],
    date: '2016-09-01',
    time: '12:01',
    region: ['广东省', '广州市', '海珠区'],
    customItem: '全部'
  }

  public onLoad(options: this['options']) :void{
    // console.log(options);   onload 加载时传的值
    



  }

  public clickTo() :void{
    console.log('点击');
    wx.navigateTo({
      url:'./home?id=1'
    })  
  }

  public getInputValue(e:any) :void{
    this.setData({
      inputValue: e.detail.value
    })
  }

  public checkboxChange(e:any) :void{
    console.log('checkbox发生change事件，携带的value值为：', e.detail.value);
  }

  public formSubmit(e:any) :void{
    console.log('form发生了submit事件，携带的数据为：', e.detail.value);
  }

  public formReset() :void {
    console.log('form发生了reset事件')
  }


  bindPickerChange(e:any) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      index: e.detail.value
    })
  }

  bindMultiPickerChange(e:any){
    this.setData({
      multiIndex: e.detail.value
    })
  }

  bindMultiPickerColumnChange(e:any){
    const data= {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[e.detail.column] = e.detail.value;

    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['扁形动物', '线形动物', '环节动物', '软体动物', '节肢动物'];
            data.multiArray[2] = ['鼻涕虫', '吸血虫'];
            break
          case 1:
            data.multiArray[1] = ['鱼', '两栖动物', '爬行动物'];
            data.multiArray[2] = ['鲫鱼', '带鱼'];
            break
        }
        data.multiArray[1] = 0;
        data.multiArray[2] = 0;
        break
      case 1:
        switch (data.multiIndex[0]) {
          case 0:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = ['猪肉虫', '吸血虫'];
                break
              case 1:
                data.multiArray[2] = ['蛔虫'];
                break
              case 2:
                data.multiArray[2] = ['蚂蚁', '蚂蟥'];
                break
            }
            break
          case 1:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = ['鲫鱼', '带鱼'];
                break
              case 1:
                data.multiArray[2] = ['青蛙', '娃娃鱼'];
                break
              case 2:
                data.multiArray[2] = ['蜥蜴', '龟', '壁虎'];
                break
            }
            break
        }
        data.multiIndex[2] = 0;
        break
    }

    console.log(data.multiIndex);
    this.setData(data);

  }

  bindDateChange(e:any) {
    this.setData({
      date: e.detail.value
    })
  }

  bindTimeChange(e:any) {
    this.setData({
      time: e.detail.value
    })
  }

  bindRegionChange(e:any) {
    this.setData({
      region: e.detail.value
    })
  }


  



}


PageBuilder.build(IndexPage)
