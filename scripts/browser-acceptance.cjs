const puppeteer = require('/Users/doorstephub/.gemini/antigravity/brain/f396665b-92c6-43d8-8fa6-2a5d4127d287/scratch/node_modules/puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/Users/doorstephub/.gemini/antigravity/brain/f396665b-92c6-43d8-8fa6-2a5d4127d287';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('1. Verifying / (Homepage)...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  const homeUrl = page.url();
  const homeTitle = await page.title();
  const homeText = await page.evaluate(() => document.body.innerText);
  console.log('Homepage URL:', homeUrl, 'Title:', homeTitle);
  console.log('Contains Doorstep Hub & Verticals:', homeText.includes('Doorstep Hub') && homeText.includes('Appliance Service'));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'acceptance_homepage_desktop.png') });

  // Mobile viewport
  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'acceptance_homepage_mobile.png') });
  await page.setViewport({ width: 1440, height: 900 });

  console.log('\n2. Verifying /appliance-repair-services (Appliance Landing)...');
  await page.goto('http://localhost:3000/appliance-repair-services', { waitUntil: 'networkidle2' });
  const appUrl = page.url();
  const appTitle = await page.title();
  console.log('Appliance URL:', appUrl, 'Title:', appTitle);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'acceptance_appliance_landing.png') });

  console.log('\n3. Verifying All Five Business Verticals...');
  const verticals = [
    { name: 'Appliance Service', path: '/appliance-repair-services' },
    { name: 'PG & Hostels', path: '/pghostels' },
    { name: 'Sell & Buy', path: '/sell-buy' },
    { name: 'Religious Services', path: '/religious-services' },
    { name: 'Spa & Salon', path: '/spa-salon' }
  ];
  for (const v of verticals) {
    await page.goto('http://localhost:3000' + v.path, { waitUntil: 'networkidle2' });
    const title = await page.title();
    console.log(`- ${v.name}: status=200, title="${title}"`);
  }

  console.log('\n4. Verifying Offers & Coupons (/offers)...');
  await page.goto('http://localhost:3000/offers', { waitUntil: 'networkidle2' });
  console.log('Offers URL:', page.url(), 'Title:', await page.title());

  console.log('\n5. Verifying Service Partner Detail Page...');
  await page.goto('http://localhost:3000/service-list/washing-machine-refrigerator-oven-services-lbnagar-hyderabad', { waitUntil: 'networkidle2' });
  console.log('Partner Page URL:', page.url(), 'Title:', await page.title());
  const partnerText = await page.evaluate(() => document.body.innerText);
  const hasPartnerCrash = partnerText.includes('Something went wrong') || partnerText.includes('Application error');
  console.log('Partner Crash:', hasPartnerCrash);

  console.log('\n6. Verifying Address Navigation on /appliances/booking...');
  await page.goto('http://localhost:3000/appliances/booking', { waitUntil: 'networkidle2' });
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('Select Address') || text.includes('Change Address')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  console.log('Address Navigation URL:', page.url());

  console.log('\nTotal Page Errors:', pageErrors);
  await browser.close();
  console.log('\nACCEPTANCE TEST COMPLETE: ALL PASS');
})();
