const users = [];

export const create = async (data) => {
  users.push({ id: users.length + 1, ...data });
  return data;
};

export const findByUsername = async (username) => {
  return users.find(u => u.username === username);
};
