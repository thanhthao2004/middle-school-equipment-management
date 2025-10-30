import Joi from "joi";

export const validateCreateUser = (data) => {
  const schema = Joi.object({
    fullname: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().required(),
    experience: Joi.string().required(),
    specialization: Joi.string().required(),
    gender: Joi.string().required(),
    vision: Joi.string().required(),
    dob: Joi.string().required()
  });
  return schema.validate(data);
};
