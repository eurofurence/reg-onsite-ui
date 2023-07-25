export function getLoginURL() {
    return getLoginApiEndpoint(window.location.href);
}

function getLoginApiEndpoint(dropoffURL) {
    // eslint-disable-next-line no-undef
    const config = useRuntimeConfig();
    const dropoffURLEncoded = encodeURIComponent(dropoffURL);
    return config.public.API_BASE_URL + "/authsrv/v1/auth?app_name=registration-system&dropoff_url=" + dropoffURLEncoded;
}
