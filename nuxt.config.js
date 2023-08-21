// eslint-disable-next-line no-undef
const deploy_env = process.env.DEPLOY_ENV;
// eslint-disable-next-line no-undef
const devBaseFolder = process.env.DEV_BASE_FOLDER;
// eslint-disable-next-line no-undef
const devHost = process.env.DEV_HOST;
// eslint-disable-next-line no-undef
const prodBaseFolder = process.env.PROD_BASE_FOLDER;
// eslint-disable-next-line no-undef
const prodHost = process.env.PROD_HOST;

const pathConfig = {
    dev: {
        baseUrl: `/${devBaseFolder}/onsite/`,
        cdnUrl: `https://${devHost}/${devBaseFolder}/onsite/`,
        apiBaseUrl: `https://${devHost}/${devBaseFolder}`,
    },
    prod: {
        baseUrl: `/${prodBaseFolder}/onsite/`,
        cdnUrl: `https://${prodHost}/${prodBaseFolder}/onsite/`,
        apiBaseUrl: `https://${prodHost}/${prodBaseFolder}`,
    },
}[deploy_env];

// eslint-disable-next-line no-undef
export default defineNuxtConfig({
    app: {
        baseURL: pathConfig.baseUrl,
        cdnURL: pathConfig.cdnUrl,
        head: {
            link: [
                {
                    id: "theme-link",
                    rel: "stylesheet",
                    href: pathConfig.cdnUrl + "lara-light-ef.css",
                },
            ],
        },
    },
    css: ["flag-icons/css/flag-icons.min.css", "primevue/resources/primevue.css", "primeicons/primeicons.css", "primeflex/primeflex.css"],
    build: {
        transpile: ["primevue"],
    },
    ssr: false,
    runtimeConfig: {
        public: {
            DEPLOY_ENV: deploy_env,
            API_BASE_URL: pathConfig.apiBaseUrl,
        },
    },
    vite: {
        vue: {
            script: {
                defineModel: true,
                propsDestructure: true,
            },
        },
    },
});
