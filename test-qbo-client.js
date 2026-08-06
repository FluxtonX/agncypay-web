const fs = require('fs');
const path = require('path');
const OAuthClient = require('intuit-oauth');

async function testQboClient() {
  const tokenPath = path.join(__dirname, 'src', 'lib', 'qbo-tokens.json'); // Actually, where is qbo-tokens.json?
  // Let me just search for it or read it from process.cwd()
  const possiblePaths = [
    path.join(__dirname, 'qbo-tokens.json'),
    path.join(__dirname, 'src', 'lib', 'qbo-tokens.json'),
  ];
  
  let tokenData = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      tokenData = JSON.parse(fs.readFileSync(p, 'utf8'));
      console.log("Found token at", p);
      break;
    }
  }

  if (!tokenData) return console.log("No token file found");

  const oauthClient = new OAuthClient({
    clientId: 'test',
    clientSecret: 'test',
    environment: 'sandbox',
    redirectUri: 'http://localhost:3000/callback',
  });
  
  oauthClient.setToken(tokenData);

  const realmId = tokenData.realmId;
  const invoicesQuery = `select * from Invoice order by MetaData.LastUpdatedTime desc maxresults 10`;
  const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=${encodeURIComponent(invoicesQuery)}`;

  try {
    const response = await oauthClient.makeApiCall({ url, method: 'GET' });
    console.log("Keys on response:", Object.keys(response));
    if (response.getJson) {
      console.log("getJson() result keys:", Object.keys(response.getJson()));
      console.log("Is QueryResponse in getJson()?", !!response.getJson().QueryResponse);
    } else {
      console.log("No getJson method. Is it just JSON?", !!response.QueryResponse);
    }
    
    const parsed = response.getJson ? response.getJson() : response;
    // wait, what if the json response is actually a string?
    console.log("Type of parsed:", typeof parsed);
    if (typeof parsed === 'string') {
      console.log("It's a string! Content starts with:", parsed.substring(0, 50));
    } else if (parsed.json) {
       console.log("It has a nested .json property!");
    } else {
       console.log("It's an object with QueryResponse:", !!parsed.QueryResponse);
    }
  } catch (err) {
    console.error("API Call error:", err.message);
  }
}

testQboClient().catch(console.error);
