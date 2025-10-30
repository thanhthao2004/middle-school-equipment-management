import * as service from "../services/users.service.js";

export const showCreateForm = (req, res) => {
  res.render("users/views/create", { error: null });
};

export const createUser = async (req, res) => {
  try {
    await service.createUser(req.body);
    res.redirect("/users");
  } catch (error) {
    res.render("users/views/create", { error: error.message });
  }
};
