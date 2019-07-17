class Storage {
  set(data: Partial<StorageData>, callback?: () => void) {
    let total = Object.keys(data).length;
    let finished = 0;
    let next = () => {
      finished += 1;
      if (finished == total) {
        callback && callback();
      }
    }
    let key: keyof StorageData;
    for (key in data) {
      let _key = key;
      wx.setStorage({
        key: key,
        data: data[_key],
        success: () => {
          next()
        },
        fail: () => {
          console.error("设置储存字段失败:", _key, data[_key])
          next();
        }
      });
    }
  }

  get<K extends StorageKey>(keys: K[], callback: (data: Pick<StorageData, K>) => void) {
    let total = keys.length;
    let finished = 0;
    let res: Pick<StorageData, K> = {} as any;
    let next = () => {
      finished += 1;
      if (finished == total) {
        callback(res);
      }
    }
    for (let key of keys) {
      wx.getStorage({
        key: key,
        success: ({ data }) => {
          res[key] = data;
          next()
        },
        fail: (e) => {
          res[key] = null;
          console.warn("获取储存字段失败:", key);
          next();
        }
      });
    }
  }
}


export let storage = new Storage();