# On-Site Registration and Sponsor Frontend

This is the frontend for the EF registration and sponsor desks

## Known Problems:

- RegDesk: Selection on pages other than the first one raise an exception (seems not to affect core functionality): https://github.com/primefaces/primevue/issues/3888
- Cookies are not stored properly (workaround implemented): https://github.com/nuxt/nuxt/issues/22001

## Setup

Make sure to install the dependencies

```bash
yarn install
```

## Development

Start the development server on http://localhost:3000

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment).
