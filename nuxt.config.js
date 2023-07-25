// eslint-disable-next-line no-undef
const env = process.env.DEPLOY_ENV;
// eslint-disable-next-line no-undef
const devBaseFolder = process.env.DEV_BASE_FOLDER;
// eslint-disable-next-line no-undef
const prodBaseFolder = process.env.PROD_BASE_FOLDER;

const pathConfig = {
    dev: {
        baseUrl: `/${devBaseFolder}/onsite/`,
        cdnUrl: `https://regtest.eurofurence.org/${devBaseFolder}/onsite/`,
        apiBaseUrl: `https://regtest.eurofurence.org/${devBaseFolder}`,
    },
    prod: {
        baseUrl: `/${prodBaseFolder}/onsite/`,
        cdnUrl: `https://reg.eurofurence.org/${prodBaseFolder}/onsite/`,
        apiBaseUrl: `https://reg.eurofurence.org/${prodBaseFolder}`,
    },
}[env];

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
