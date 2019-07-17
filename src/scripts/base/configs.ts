export let configs: AppConfigs = {
  initPage: 'home',
  apiHost: "",
  assetsDir: "",
  skipAuthCheck: false,
  forceLogin: false,
  debugUserOpenid: null,
  debugUserToken: null,
}

import { localConfigs } from "./localConfigs";
let key: keyof AppConfigs;
for (key in localConfigs) {
  configs[key] = localConfigs[key];
}
