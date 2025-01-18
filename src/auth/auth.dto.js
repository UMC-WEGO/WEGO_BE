// src/auth/auth.dto.js

export class SignUpDto {
    constructor(email, password, nickname, marketing_consent, info_consent) {
      this.email = email;
      this.password = password;
      this.nickname = nickname;
      this.marketing_consent = marketing_consent;
      this.info_consent = info_consent;
    }
  }

export class LoginDto {
    constructor(email, password) {
      this.email = email;
      this.password = password;
    }
}

export class RefreshDto {
  constructor(refreshToken) {
    this.refreshToken = refreshToken;
  }
}

export class NicknameCheckDTO {
  constructor(nickname) {
    this.nickname = nickname;
  }
}

export class EmailCheckDTO {
  constructor(email) {
    this.email = email;
  }
}

