# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
pip install nodeenv
nodeenv env -n 22.8.0
source env/bin/activate
cd onsite
yarn install
```

## Development Server

Take the file `environment.template.ts` from the root folder,
fill it with the correct information and place the new file into
`onsite/app/config/environment.ts`.

Start the development server on `http://localhost:8000`:

```bash
# yarn
yarn dev
```

## Production

Build the application docker image for test / production:

```bash
# yarn
yarn run docker-test
yarn run docker-live
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
