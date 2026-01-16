
const { scanNetworkRange } = require('./src/app/actions/network-scanner');

// Mock specific internal functions if needed, or just run the public one
// Note: Since this environment might not have raw socket access, 
// this is more of a logic check.

async function verify() {
    console.log("Starting verification scan...");
    try {
        // Scan localhost range (127.0.0.1) just to trigger the code
        // It won't find anything via TCP connect usually, but ensures no crash.
        const result = await scanNetworkRange('127.0.0.1', '127.0.0.1');
        console.log("Scan Result:", result);
    } catch (e) {
        console.error("Scan failed:", e);
    }
}

verify();
