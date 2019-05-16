import { createSelector } from "reselect";
import { schema, denormalize } from "normalizr";

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
      const uniqueAccountIds = denormalizedData.reduce(
        (allAccounts, product) => {
          const accountsForOrders = product.orders.reduce(
            (orderAccounts, order) => {
              if (orderAccounts.includes(order.account)) {
                return orderAccounts;
              }
              return orderAccounts.concat(order.account.id);
            },
            []
          );

          const accountsToReturn = allAccounts.concat(
            accountsForOrders.filter(account => !allAccounts.includes(account))
          );

          return accountsToReturn;
        },
        []
      );

      return Object.values(entities.accounts).filter(account =>
        uniqueAccountIds.includes(account.id)
      );
    }
    return Object.values(entities.accounts);
  }
);
