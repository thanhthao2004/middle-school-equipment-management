import * as repo from "../repositories/users.repo.js";
import * as validator from "../validators/users.validators.js";

export const createUser = async (data) => {
  const { error } = validator.validateCreateUser(data);
  if (error) throw new Error(error.message);

  // Kiểm tra trùng username
  const exists = await repo.findByUsername(data.username);
  if (exists) throw new Error("Tên người dùng đã tồn tại!");

  return repo.create(data);
};
