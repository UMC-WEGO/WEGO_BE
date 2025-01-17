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
