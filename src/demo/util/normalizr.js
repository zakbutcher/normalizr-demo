import { createSelector } from "reselect";
import { schema, denormalize, normalize } from "normalizr";

// #region Schema Definitions
const mergeOrders = (a = [], b = []) => a.concat(b);

export const accountSchema = new schema.Entity("accounts");
export const productSchema = new schema.Entity(
  "products",
  {},
  {
    mergeStrategy: (productA, productB) => ({
      ...productA,
      orders: mergeOrders(productA.orders, productB.orders)
    })
  }
);
export const orderSchema = new schema.Entity(
  "orders",
  {
    account: accountSchema,
    products: new schema.Array(productSchema)
  },
  {
    processStrategy: order => ({
      ...order,
      products: order.products.map(product => ({
        ...product,
        orders: [order.id]
      }))
    })
  }
);
productSchema.define({ orders: new schema.Array(orderSchema) });
// #endregion Schema Definitions

const getSecondArg = (state, secondArg) => secondArg;
const getEntities = state => state.entities;
export const getAccounts = state => Object.values(state.entities.accounts);
export const getOrders = state => Object.values(state.entities.orders);
export const getProducts = state => Object.values(state.entities.products);

export const selectAccountsForProductName = createSelector(
  [getSecondArg, getEntities],
  (productName, entities) => {
    // If no product name is provided, return all accounts
    if (!!productName) {
      const startTime = new Date();
      // Get list of products matching provided product name
      const matchingProductIds = Object.values(entities.products)
        .filter(product =>
          product.name
            .toLocaleLowerCase()
            .includes(productName.toLocaleLowerCase())
        )
        .map(product => product.id);

      if (!matchingProductIds) return [];

      // Denormalize data to build data structure based on relationships in schema
      const denormalizedData = denormalize(
        matchingProductIds,
        [productSchema],
        entities
      );
      console.log("Denormalized Data: ", denormalizedData);

      // Normalize data to destructure data based on schemas
      const normalizedData = normalize(denormalizedData, [productSchema]);
      console.log("Re-Normalized Data: ", normalizedData);

      const endTime = new Date();
      console.log(`normalizr time -> ${endTime - startTime}ms`);
      // Return accounts or an empty array
      return !!normalizedData.entities.accounts
        ? Object.values(normalizedData.entities.accounts)
        : [];
    }
    return Object.values(entities.accounts);
  }
);

// Manual method without normalizr
export const filterAccountsForProductName = (productName, accounts, orders) => {
  // If no product name is provided, return all accounts
  if (!!productName) {
    const startTime = new Date();
    // Get list of orders with matching products
    const ordersWithProduct = orders.reduce((matchingOrders, currentOrder) => {
      const hasMatchingProduct = currentOrder.products.find(product =>
        product.name
          .toLocaleLowerCase()
          .includes(productName.toLocaleLowerCase())
      );
      return hasMatchingProduct
        ? matchingOrders.concat(currentOrder)
        : matchingOrders;
    }, []);

    // Get list of account ids associated with matching orders
    const accountsIdsForProduct = ordersWithProduct.reduce(
      (uniqueAccountIds, currentOrder) => {
        return uniqueAccountIds.includes(currentOrder.account)
          ? uniqueAccountIds
          : uniqueAccountIds.concat(currentOrder.account);
      },
      []
    );

    const endTime = new Date();
    console.log(`manual time -> ${endTime - startTime}ms`);
    // Get account objects for matching accounts
    return accounts.filter(account =>
      accountsIdsForProduct.includes(account.id)
    );
  }
  return accounts || [];
};
