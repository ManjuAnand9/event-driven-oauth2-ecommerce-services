import { apiFetch } from "./api";

export async function getProducts(
  page = 0,
  size = 20
) {
  return apiFetch(
    `/PRODUCT-SERVICE/products?page=${page}&size=${size}`,
    {
      skipAuth: true
    }
  );
}

export async function getProductById(id) {
  return apiFetch(
    `/PRODUCT-SERVICE/getproduct/${id}`,
    {
      skipAuth: true
    }
  );
}

export async function requestUploadUrl(file) {
  return apiFetch("/PRODUCT-SERVICE/product-image/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream"
    })
  });
}

export async function uploadFileToPresignedUrl(uploadUrl, file) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream"
    },
    body: file
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `S3 upload failed: ${response.status}`);
  }

  return response.status;
}

export async function addProduct(product) {
  return apiFetch("/PRODUCT-SERVICE/addproduct", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });
}
