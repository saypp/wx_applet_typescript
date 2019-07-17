interface AppConfigs {
  devMode?: boolean;
  initPage?: string;
  apiHost?: string;
  assetsDir: string;
  skipAuthCheck: boolean;
  debugUserOpenid: string;
  debugUserToken: string;
  forceLogin: boolean;
}

// mpa global types
type Constructor<T> = new (...args: any[]) => T;

/** 时间戳，单位毫秒 */
type Timestamp = number;

/** 时间戳，单位秒 */
type TimestampSec = number;

/** 时间戳，字符串格式，单位毫秒 */
type TimestampString = string;

/** string that can be JSON.parse */
type JsonString = string;

/** binary number, 1 to true, 0 to false */
type BoolNum = 1 | 0;

type Int = number;

type ImageType = "gif" | "png" | "jpeg" | "webp" | "other";

interface HTTPHeaders {
  [name: string]: string
}

type PureData = string | number | boolean;

interface PureDataDict {
  [name: string]: PureData | PureDataDict
}

type HashMap<D> = {
  [key: string]: D
}
