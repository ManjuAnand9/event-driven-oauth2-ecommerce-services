import { apiFetch } from "./api";

export async function getCustomerOrders(
  email,
  page = 0,
  size = 100
) {

  return apiFetch(
    `/ORDER-SERVICE/customer-orders?email=${encodeURIComponent(email)}&page=${page}&size=${size}`
  );
}

export async function placeOrder(request) {

  return apiFetch(
    "/ORDER-SERVICE/placeorder",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
}