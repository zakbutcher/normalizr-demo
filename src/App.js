import React, { useReducer } from "react";
import "./App.css";
import { Column, Row, Accordion } from "./demo";
import { normalize } from "normalizr";
import {
  getAccounts,
  getOrders,
  getProducts,
  accountSchema,
  orderSchema,
  selectAccountsForProductName,
  filterAccountsForProductName
} from "./demo/util/normalizr";

// #region Demo Data
import orderData from "./demo/data/orders.json";
import accountData from "./demo/data/accounts.json";
// #endregion Demo Data
// #region State Setup
const initialState = {
  entities: {
    accounts: {},
    orders: {},
    products: {}
  },
  accounts: [],
  orders: [],
  filterProductName: ""
};
// #endregion State Setup
// #region App Reducer - Demo
const stateReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_DATA":
      const normalizedOrders = normalize(orderData, [orderSchema]);
      const normalizedAccounts = normalize(accountData, [accountSchema]);
      return {
        ...state,
        entities: {
          ...state.entities,
          ...normalizedOrders.entities,
          ...normalizedAccounts.entities
        },
        accounts: accountData,
        orders: orderData
      };
    case "SET_FILTER_PRODUCT_NAME":
      return {
        ...state,
        filterProductName: action.payload.id
      };
    default:
      return state;
  }
};
// #endregion App Reducer - Demo
// #region App Actions
const fetchDataAction = () => ({
  type: "FETCH_DATA"
});
const setFilterProductName = (id = "") => ({
  type: "SET_FILTER_PRODUCT_NAME",
  payload: {
    id
  }
});
// #endregion App Actions

function App() {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  // #region Callbacks
  const fetchData = () => dispatch(fetchDataAction());
  const updateFilterProductName = event =>
    dispatch(setFilterProductName(event.target.value));
  // #endregion Callbacks
  // #region Selectors - Demo
  const accounts = getAccounts(state);
  const orders = getOrders(state);
  const products = getProducts(state);
  const normalizedFilteredAccounts = selectAccountsForProductName(
    state,
    state.filterProductName
  );
  const manuallyFilteredAccounts = filterAccountsForProductName(
    state.filterProductName,
    state.accounts,
    state.orders
  );
  // #endregion Selectors - Demo

  console.log("current state: ", state);
  return (
    <div className="App">
      <header className="App-header">
        <Row>
          Click to get started ->
          <button onClick={fetchData}>Fetch Data</button>
        </Row>
        <Accordion>
          {{
            titleBar: "Accounts",
            content: (
              <Column>
                {accounts.map(account => (
                  <Row key={account.id}>{account.name}</Row>
                ))}
              </Column>
            )
          }}
        </Accordion>
        <Accordion>
          {{
            titleBar: "Orders",
            content: (
              <Column>
                {orders.map(order => (
                  <Row key={order.id}>{order.name}</Row>
                ))}
              </Column>
            )
          }}
        </Accordion>
        <Accordion>
          {{
            titleBar: "Products",
            content: (
              <Column>
                {products.map(product => (
                  <Row key={product.id}>{product.name}</Row>
                ))}
              </Column>
            )
          }}
        </Accordion>
        <Row>
          Product Name: <input onChange={updateFilterProductName} />
        </Row>
        <Accordion>
          {{
            titleBar: "Using normalizr",
            content: (
              <Column>
                {normalizedFilteredAccounts &&
                  normalizedFilteredAccounts.map(account => (
                    <Row key={account.id}>{account.name}</Row>
                  ))}
              </Column>
            )
          }}
        </Accordion>
        <Accordion>
          {{
            titleBar: "Manual Filtering",
            content: (
              <Column>
                {manuallyFilteredAccounts &&
                  manuallyFilteredAccounts.map(account => (
                    <Row key={account.id}>{account.name}</Row>
                  ))}
              </Column>
            )
          }}
        </Accordion>
      </header>
    </div>
  );
}

export default App;
