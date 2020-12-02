const ProductsService = require("./products.service");

async function productExists(req, res, next) {
  const error = { status: 404, message: `Product cannot be found.` };

  const { productId } = req.params;
  if (!productId) return next(error);

  let { included = [] } = req.query;
  included = Array.isArray(included) ? included : [included];

  let product;

  if (included.length === 0) {
    product = await ProductsService.getProductById(productId);
  }

  // /products/:productId?included=categories
  if (included.includes("categories") && !included.includes("suppliers")) {
    product = await ProductsService.getProductByIdWithCategories(productId);
  }

  // /products/:productId?included=suppliers
  if (!included.includes("categories") && included.includes("suppliers")) {
    product = await ProductsService.getProductByIdWithSuppliers(productId);
  }

  // /products/:productId?included=categories&included=suppliers
  if (included.includes("categories") && included.includes("suppliers")) {
    product = await ProductsService.getProductByIdWithCategoriesAndSuppliers(
      productId
    );
  }

  if (!product) return next(error);

  res.locals.product = product;

  next();
}

function queryParametersAreValid(req, res, next) {
  const validQueryParameters = {
    get_out_of_stock_count: ["1"],
    get_prices_summary_stats: ["1"],
    get_total_weight: ["1"],
    included: ["categories"],
  };

  for (const [key, value] of Object.entries(req.query)) {
    if (
      !validQueryParameters[key] ||
      !validQueryParameters[key].includes(value)
    ) {
      return next({
        status: 400,
        message: `${key}=${value} is not a valid query parameter.`,
      });
    }
  }

  let {
    get_out_of_stock_count: getOutOfStockCount = "",
    get_prices_summary_stats: getPricesSummaryStats = "",
    get_total_weight: getTotalWeight = "",
    included = [],
  } = req.query;

  included = Array.isArray(included) ? included : [included];

  res.locals.query = {
    getOutOfStockCount,
    getPricesSummaryStats,
    getTotalWeight,
    included,
  };

  next();
}

function read(req, res, next) {
  const { product } = res.locals;
  res.json({ data: product });
}

async function list(req, res, next) {
  const { query } = res.locals;
  const {
    getOutOfStockCount,
    getPricesSummaryStats,
    getTotalWeight,
    included,
  } = query;

  let products;

  // /products
  if (!getOutOfStockCount && !getPricesSummaryStats && !getTotalWeight) {
    products = await ProductsService.getAllProducts();
  }
  // /products?get_out_of_stock_count=1
  if (getOutOfStockCount === "1") {
    products = await ProductsService.getOutOfStockProductsCount();
  }

  // /products?get_prices_summary_stats=1
  if (getPricesSummaryStats === "1") {
    products = await ProductsService.getMinMaxAveragePricesOfProductsBySupplier();
  }

  // /products?get_total_weight=1
  if (getTotalWeight === "1") {
    products = await ProductsService.getTotalWeightOfEachProduct();
  }

  // /products?get_total_weight=1&included=categories
  if (getTotalWeight === "1" && included.includes("categories")) {
    products = await ProductsService.getTotalWeightOfProductsByCategory();
  }
  res.json({ data: products });
}

module.exports = {
  read: [productExists, read],
  list: [queryParametersAreValid, list],
};
