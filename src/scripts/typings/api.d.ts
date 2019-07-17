declare namespace ApiTypes {

  type HTTPStatusCode = 200 | 404 | 403 | 500;

  interface FailOrErrorParmas {
    httpStatusCode: ApiTypes.HTTPStatusCode,
    msg?: string,
    statusCode?: number
  }

  interface APIQueryArgCollection {
    [name: string]: number | string | boolean;
  }

  interface APIBodyArgCollection {
    [name: string]: any;
  }

  interface ApiBaseResult {
    success: boolean,
    statusCode: number,
    statusMessage: string
  }
}


declare namespace PostDatas {

  interface PostBase {
    title: string,
    userPhoneNumber: number,
    wxId?: string,
  }

  interface ContactFormData {
    name: string,
    phoneNumber: string,
    budget: string,
    mpNickname: string,
    mpId: string,
    mpFansCount: string
  }
}