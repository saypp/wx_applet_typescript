declare namespace Models {

  interface BaseModel {
    id: string;
    createdAt: Timestamp;
  }

  interface User {
    openid: string;
    nickname: string;
    token: string;
    gender: 0 | 1 | 2,
    avatar: string;
    rebornQuota: Int;
    balance: number;
    inviteCount: number;
    city: string;
    coin: number,
    phoneNumber: string
  }
}

declare namespace LocalData {
}
