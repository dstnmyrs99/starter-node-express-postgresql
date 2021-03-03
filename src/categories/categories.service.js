const knex = require("../db/connection");

const getAllCategories = () => knex("categories").select("*");

const getCount = () => knex("categories").count("*");

module.exports = {
  getAllCategories,
  getCount
};
