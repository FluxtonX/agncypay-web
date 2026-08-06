const fs = require('fs');
const path = require('path');
const OAuthClient = require('intuit-oauth');

async function testQbo() {
  const tokenPath = path.join(__dirname, 'qbo-tokens.json');
  if (!fs.existsSync(tokenPath)) {
    console.error("No token found");
    return;
  }
  
  const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const realmId = tokenData.realmId;
  
  if (!realmId) {
    console.error("No realmId found");
    return;
  }

  // NOTE: We do not need the real client ID / secret just to make an API call if the token is valid,
  // but intuit-oauth might require it. Let's try to initialize it minimally.
  // Actually, we can just use native fetch to make the API call with the access token!
  const accessToken = tokenData.access_token;
  
  const environment = "sandbox";
  const baseUrl = environment === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

  const invoicesQuery = `select * from Invoice order by MetaData.LastUpdatedTime desc maxresults 10`;
  const url = `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(invoicesQuery)}`;

  console.log("Fetching from:", url);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

testQbo().catch(console.error);
