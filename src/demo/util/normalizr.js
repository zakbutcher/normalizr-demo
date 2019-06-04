import { createSelector } from "reselect";
import { schema, denormalize, normalize } from "normalizr";

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

const getSecondArg = (state, secondArg) => secondArg;
const getEntities = state => state.entities;
export const getAccounts = state => Object.values(state.entities.accounts);
export const getOrders = state => Object.values(state.entities.orders);
export const getProducts = state => Object.values(state.entities.products);

export const selectAccountsForProductName = createSelector(
  [getSecondArg, getEntities],
  (productName, entities) => {
    if (!!productName) {
      // Get list of products matching provided product name
      const matchingProductIds = Object.values(entities.products)
        .filter(product =>
          product.name.toLocaleLowerCase().includes(productName)
        )
        .map(product => product.id);

      if (!matchingProductIds) return [];

      const denormalizedData = denormalize(
        matchingProductIds,
        [productSchema],
        entities
      );

      const normalizedData = normalize(denormalizedData, [productSchema]);
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
    // Get list of orders with matching products
    const ordersWithProduct = orders.reduce((matchingOrders, currentOrder) => {
      const hasMatchingProduct = currentOrder.products.find(product =>
        product.name.toLocaleLowerCase().includes(productName)
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

    // Get account objects for matching accounts
    return accounts.filter(account =>
      accountsIdsForProduct.includes(account.id)
    );
  }
  return accounts || [];
};
