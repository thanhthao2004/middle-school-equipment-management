export class User {
  constructor({
    fullname, phone, address, username, password,
    role, experience, specialization, gender, vision, dob
  }) {
    Object.assign(this, {
      fullname, phone, address, username, password,
      role, experience, specialization, gender, vision, dob
    });
  }
}
