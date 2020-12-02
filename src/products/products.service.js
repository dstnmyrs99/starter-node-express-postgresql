const knex = require("../db/connection");

const products = knex("products");

const productsSuppliersJoin = knex("products as p").join(
  "suppliers as s",
  "p.supplier_id",
  "s.supplier_id"
);

const productsCategoriesJoin = knex("products as p")
  .join("products_categories as pc", "p.product_id", "pc.product_id")
  .join("categories as c", "pc.category_id", "c.category_id");

const productsCategoriesSuppliersJoin = knex("products as p")
  .join("products_categories as pc", "p.product_id", "pc.product_id")
  .join("categories as c", "pc.category_id", "c.category_id")
  .join("suppliers as s", "p.supplier_id", "s.supplier_id");

const getAllProducts = () => products.select("*");

const getProductById = productId =>
  products.select("*").where({ product_id: productId }).first();

const getOutOfStockProductsCount = () =>
  products
    .select("product_quantity_in_stock as out_of_stock")
    .count()
    .where({ product_quantity_in_stock: 0 })
    .groupBy("out_of_stock");

const getMinMaxAveragePricesOfProductsBySupplier = () =>
  products
    .select("supplier_id")
    .min("product_price")
    .max("product_price")
    .avg("product_price")
    .groupBy("supplier_id")
    .orderBy("supplier_id");

const getTotalWeightOfEachProduct = () =>
  products
    .select(
      "product_sku",
      "product_title",
      knex.raw(
        "sum(product_weight_in_lbs * product_quantity_in_stock) as total_weight_in_lbs"
      )
    )
    .groupBy("product_title", "product_sku")
    .orderBy("total_weight_in_lbs");

const getProductByIdWithCategories = productId =>
  productsCategoriesJoin
    .select("p.*", "c.*")
    .where({ "p.product_id": productId })
    .first();

const getProductByIdWithSuppliers = productId =>
  productsSuppliersJoin
    .select("p.*", "s.*")
    .where({ "p.product_id": productId })
    .first();

const getProductByIdWithCategoriesAndSuppliers = productId =>
  productsCategoriesSuppliersJoin
    .select("p.*", "c.*", "s.*")
    .where({ "p.product_id": productId })
    .first();

const getTotalWeightOfProductsByCategory = () =>
  productsCategoriesJoin
    .select(
      "c.category_name",
      knex.raw(
        "sum(p.product_weight_in_lbs * p.product_quantity_in_stock) as total_weight_by_category"
      )
    )
    .groupBy("c.category_name")
    .orderBy("total_weight_by_category");

module.exports = {
  getAllProducts,
  getProductById,
  getOutOfStockProductsCount,
  getMinMaxAveragePricesOfProductsBySupplier,
  getTotalWeightOfEachProduct,
  getProductByIdWithCategories,
  getProductByIdWithSuppliers,
  getProductByIdWithCategoriesAndSuppliers,
  getTotalWeightOfProductsByCategory,
};
