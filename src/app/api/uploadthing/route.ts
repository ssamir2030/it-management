import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Get the correct callback URL based on environment
const getCallbackUrl = () => {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    return undefined; // Let UploadThing auto-detect in development
};

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
    config: {
        callbackUrl: getCallbackUrl(),
    },
});
