
import { apiFetch } from "./api";

export async function getCustomerByEmail(email) {

    console.log("CUSTOMER LOOKUP EMAIL:", email);

    return apiFetch(
        `/CUSTOMER-SERVICE/getcustomerbyemail?email=${encodeURIComponent(email)}`,
        { skipAuth: true }
    );
}

export async function createCustomer(customer) {
    return apiFetch(
        "/CUSTOMER-SERVICE/createcustomer",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customer)
        }
    );
}