import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  const html = await page.content();
  if (html.includes('0 PRODUCTS FOUND')) {
      console.log('Localhost also has 0 products!');
  } else {
      console.log('Localhost is fetching products successfully!');
  }
  await browser.close();
})();
