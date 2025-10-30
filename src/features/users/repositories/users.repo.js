const users = [];

const create = async (data) => {
  users.push({ id: users.length + 1, ...data });
  return data;
};

const findByUsername = async (username) => {
  return users.find(u => u.username === username);
};

const getAll = async () => users;

module.exports = {
  create,
  findByUsername,
  getAll
};