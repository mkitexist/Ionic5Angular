export class User {
  constructor(
    public id: string,
    public email: string,
    private _token: string,
    public tokenExpirationDate: Date,
  ) { }
  get token() {
    if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null;
    }
    // eslint-disable-next-line no-underscore-dangle
    return this._token;
  }
  get tokenDuration() {
    if (!this.token) {
      return 0;
    }
    // return 20000;
    return this.tokenExpirationDate.getTime() - new Date().getTime();
  }
}
// export class User {
//   id: string;
//   email: string;
//   _token: string;
//   tokenExpirationDate: Date;


//   get token() {
//     if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
//       return null;
//     }
//     // eslint-disable-next-line no-underscore-dangle
//     return this._token;
//   }
// }
