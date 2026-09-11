import https from 'node:https';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  const htmlRes = await fetch('https://apex-education-forum.web.app/');
  console.log('HTML Status:', htmlRes.status);
  console.log('Contains english-framework:', htmlRes.data.includes('english-framework'));
  console.log('Contains section-courses:', htmlRes.data.includes('section-courses'));

  const scriptMatch = htmlRes.data.match(/src="([^"]*assets\/index[^"]*\.js)"/);
  if (scriptMatch) {
    const jsUrl = 'https://apex-education-forum.web.app' + (scriptMatch[1].startsWith('/') ? '' : '/') + scriptMatch[1];
    console.log('Fetching JS:', jsUrl);
    const jsRes = await fetch(jsUrl);
    console.log('JS Contains english-framework:', jsRes.data.includes('english-framework'));
    console.log('JS Contains Full-Stack Web Development:', jsRes.data.includes('Full-Stack Web Development'));
    console.log('JS Contains apex_fresh_clean_v9:', jsRes.data.includes('apex_fresh_clean_v9'));
  }
}

run().catch(console.error);
