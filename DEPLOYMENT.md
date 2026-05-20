# Deployment Guide: Custom Subdomain with OVHcloud and Cloudflare Pages

To link your custom subdomain `split.sovcore.eu` (managed by OVHcloud) to your Cloudflare Pages deployment, follow these steps:

## 1. Configure Cloudflare Pages
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** and select your `split` project.
3. Go to the **Custom domains** tab.
4. Click **Set up a custom domain**.
5. Enter `split.sovcore.eu` and click **Continue**.
6. Cloudflare will generate a CNAME target for you, typically `<project-name>.pages.dev`.

## 2. Configure OVHcloud DNS
1. Log in to your [OVHcloud Control Panel](https://www.ovh.com/manager/).
2. Go to **Web Cloud** > **Domain names** > `sovcore.eu`.
3. Select the **DNS zone** tab.
4. Click **Add an entry** (or modify if it already exists).
5. Select **CNAME** as the record type.
6. For **Subdomain**, enter `split`.
7. For **Target**, enter the `.pages.dev` address provided by Cloudflare (e.g., `split-xxxx.pages.dev.`). **Note:** Some interfaces require a trailing dot.
8. Save the record.

## 3. Verification
1. Return to the Cloudflare Pages **Custom domains** tab.
2. Cloudflare will periodically check the DNS record. You can click **Check DNS** to speed it up.
3. Once verified, Cloudflare will automatically provision an SSL certificate for your subdomain.

## 4. Security Headers
Ensure your `public/_headers` file remains in the repository, as it contains critical security headers (COOP/COEP) required for the WebAssembly engine to operate in a secure, isolated process.
