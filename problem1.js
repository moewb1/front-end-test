function valideEmail(mail) {
  if (!mail || mail.length > 256) {
    return false;
  }

  for (let i = 0; i < mail.length; i++) {
    const char = mail[i];
    if (!((char >= 'a' && char <= 'z') || 
          (char >= 'A' && char <= 'Z') || 
          (char >= '0' && char <= '9') || 
          char === '@' || char === '.')) {
        return false;
    }
  }

  if ( mail === null) {
    return false;
  }

  const parts = mail.split('@');

  if (parts.length !== 2) {
    return false;
  }

  const username = parts[0];
  const domain = parts[1];


  if (username.length === 0 || domain.length === 0) {
    return false;
  }

  if (!domain.includes('.') || domain.endsWith('.')) {
    return false;
  }
  if (!domain.endsWith('.com') || domain.length <= 4) {
    return false;
  }

  if (domain.startsWith('.')) {
    return false;
  }

  return true;
}
console.log(valideEmail(" "));
console.log(valideEmail("jhon.doe@gmail.com"));
console.log(valideEmail("jh$on.doe@gmail.com"));
console.log(valideEmail("jhon.doe@@gmail.com"));
console.log(valideEmail("@gmail.com"));
console.log(valideEmail("jhon.doe@gmail.co"));
console.log(valideEmail("jhon.doegmail.com"));
console.log(valideEmail("a@.com"));
console.log(valideEmail("user@.com"));
