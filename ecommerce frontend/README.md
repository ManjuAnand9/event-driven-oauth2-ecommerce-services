# NovaCart React Router UI

Updated React frontend for your Spring Boot ecommerce microservices project.

## Features

- All products displayed on the home page below the hero.
- All products fetched across every backend pagination page.
- Separate React routes for:
  - `/products`
  - `/deals`
  - `/category/Electronics`
  - `/category/Computers`
  - `/category/Home`
  - `/category/Fashion`
  - `/search?q=...`
- Category buttons actually navigate to dedicated pages.
- Product category pages filter live backend products.
- Presigned S3 image URLs displayed in product cards.
- Admin product creation with direct presigned PUT upload to S3.
- Cart and place-order API integration.
- Orders modal with product images.
- Developer panel with request/response/flow.
- Kafka UI link after place order.
- Browser-local OAuth2 bearer token.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Environment

```env
VITE_API_GATEWAY=http://localhost:8080
VITE_KAFKA_UI=http://localhost:8085
VITE_DEFAULT_CUSTOMER_ID=1
```

Change `VITE_DEFAULT_CUSTOMER_ID` to an existing customer ID.

## Important category behavior

Category filtering uses the exact category string returned by Product Service, case-insensitively.

For example:

```json
{
  "category": "Electronics"
}
```

will appear under:

```text
/category/Electronics
```

If your database uses categories such as `electronics-accessories`, add corresponding links/routes or normalize them in the UI.

## Browser routing on Vercel

Because this uses React Router, configure Vercel to rewrite routes back to `index.html`.
A `vercel.json` file is included.
