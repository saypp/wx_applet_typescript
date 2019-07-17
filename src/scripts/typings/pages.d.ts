interface PageOptions {
  // tabs
  home: { fromMp?: string, scene?: string, channel?: string, userOpenid?: string, inviterToken?: string };

}

type PageName = keyof PageOptions;