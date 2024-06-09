export class User {
	constructor(public email: string, private _token: string, private _tokenExpirationDate: Date, public userData?: UserV2) {

	}

	get token() {
		if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
			return null;
		}
		return true;
	}
}

export class UserV2{
  "Id": string
  "username": string
  "fullName": string
  "userType": string
  "email": string
  "description": string
  "verified": number
  "photo": string | null
  "favoriteFunds": string[] | []
}


