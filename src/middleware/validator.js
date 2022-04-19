const joi = require("@hapi/joi");

const schemaRegister = joi.object({
    name: joi.string().required(),
    email: joi.string().email().lowercase().required(),
    phone: joi.string().regex(/^[0-9]+$/).max(11).required(),
    birthday: joi.date().required(),
    address: joi.string().required(),
})

const chemaLogin = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
})

module.exports = {schemaRegister, chemaLogin};