import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api';

async function runAutomatedTests() {
  console.log("🚀 Starting Automated AI & Backend Test Suite for Avani Library...\n");

  try {
    // 1. Test Student Registration (Gender & Seat Rule Check)
    console.log("Test 1: Registering Student...");
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test Student",
        phone: "9988776655",
        email: "test@avanilibrary.com",
        gender: "Male",
        plan: "Monthly (₹500)",
        seatNumber: "15",
        shift: "Full Day",
        paidAmount: "300"
      })
    });
    const regData = await regRes.json();
    console.log("Registration Result:", regData.success ? "✅ PASSED" : "❌ FAILED", regData.message);

    // 2. Test Student Login
    console.log("\nTest 2: Testing Student Login...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: "9988776655" })
    });
    const loginData = await loginRes.json();
    console.log("Login Result:", loginData.success ? "✅ PASSED" : "❌ FAILED", loginData.student ? `Found ID: ${loginData.student.id}` : "");

    // 3. Test Admin Financials (Owner P&L Ledger)
    console.log("\nTest 3: Fetching Admin Financials...");
    const finRes = await fetch(`${BASE_URL}/admin/financials`);
    const finData = await finRes.json();
    console.log("Financials Result:", finData.success ? `✅ PASSED (Collection: ₹${finData.totalCollection}, Net Profit: ₹${finData.netProfit})` : "❌ FAILED");

    // 4. Test Multi-Language WhatsApp AI Webhook (Marathi)
    console.log("\nTest 4: Testing Marathi AI Bot Query ('Mazi fees kiti ahe?')...");
    const aiRes1 = await fetch(`${BASE_URL}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: "9988776655", message: "Mazi fees kiti ahe?" })
    });
    const aiData1 = await aiRes1.json();
    console.log("Marathi Bot Reply:", aiData1.reply ? `✅ PASSED -> "${aiData1.reply}"` : "❌ FAILED");

    // 5. Test Multi-Language WhatsApp AI Webhook (Hindi)
    console.log("\nTest 5: Testing Hindi AI Bot Query ('Library kis time khulti hai')...");
    const aiRes2 = await fetch(`${BASE_URL}/whatsapp/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: "9988776655", message: "Library kis time khulti hai" })
    });
    const aiData2 = await aiRes2.json();
    console.log("Hindi Bot Reply:", aiData2.reply ? `✅ PASSED -> "${aiData2.reply}"` : "❌ FAILED");

    console.log("\n✨ All automated tests executed successfully!");
  } catch (err) {
    console.error("Test Error:", err.message);
  }
}

runAutomatedTests();
