import { isProductMisconfigured } from './src/lib/validation.js';

const runTests = () => {
    let failed = false;

    const assertEqual = (expected, actual, msg) => {
        if (expected !== actual) {
            console.error(`❌ FAIL: ${msg}. Expected ${expected}, got ${actual}`);
            failed = true;
        } else {
            console.log(`✅ PASS: ${msg}`);
        }
    };

    // Test 1: Misconfigured $25/$50 data is detected.
    const misconfiguredGiftCard = {
        variants: {
            edges: [
                { node: { price: { amount: "50.0" }, selectedOptions: [{ name: "Denominations", value: "$25.00" }] } },
                { node: { price: { amount: "25.0" }, selectedOptions: [{ name: "Denominations", value: "$50.00" }] } }
            ]
        }
    };
    assertEqual(true, isProductMisconfigured(misconfiguredGiftCard), "Detects misconfigured gift card");

    // Test 2: Correct $25/$50/$100 data passes (is NOT misconfigured).
    const correctGiftCard = {
        variants: {
            edges: [
                { node: { price: { amount: "25.0" }, selectedOptions: [{ name: "Denominations", value: "$25.00" }] } },
                { node: { price: { amount: "50.0" }, selectedOptions: [{ name: "Denominations", value: "$50.00" }] } },
                { node: { price: { amount: "100.0" }, selectedOptions: [{ name: "Denominations", value: "$100.00" }] } }
            ]
        }
    };
    assertEqual(false, isProductMisconfigured(correctGiftCard), "Correct gift card passes");

    // Test 3: Non-gift-card products are unaffected.
    const normalProduct = {
        variants: {
            edges: [
                { node: { price: { amount: "50.0" }, selectedOptions: [{ name: "Size", value: "Large" }] } }
            ]
        }
    };
    assertEqual(false, isProductMisconfigured(normalProduct), "Normal product passes");

    if (failed) {
        process.exit(1);
    }
};

runTests();
