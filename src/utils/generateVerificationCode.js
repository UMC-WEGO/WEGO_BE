export const generateVerificationCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let verificationCode = '';
  
    for (let i = 0; i < 6; i++) {
      verificationCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return verificationCode;
  };
  
  export default generateVerificationCode;
  