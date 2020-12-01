const SuppliersService = require("./suppliers.service.js");

async function supplierExists(req, res, next) {
  const error = { status: 404, message: `Supplier cannot be found.` };
  const { supplierId } = req.params;
  if (!supplierId) return next(error);

  let supplier = await SuppliersService.getSupplierById(supplierId);
  if (!supplier) return next(error);
  res.locals.supplier = supplier;
  next();
}

async function create(req, res, next) {
  let newSupplier = await SuppliersService.createSupplier(req.body.data);
  res.status(201).json({ data: newSupplier });
}

async function update(req, res, next) {
  const {
    supplier: { supplier_id: supplierId, ...supplier },
  } = res.locals;
  const updatedSupplier = { ...supplier, ...req.body.data };

  const data = await SuppliersService.updateSupplierById(
    supplierId,
    updatedSupplier
  );
  res.json({ data });
}

async function destroy(req, res, next) {
  const { supplier } = res.locals;
  await SuppliersService.deleteSupplierById(supplier.supplier_id);
  res.sendStatus(204);
}

module.exports = {
  create: [create],
  update: [supplierExists, update],
  destroy: [supplierExists, destroy],
};
