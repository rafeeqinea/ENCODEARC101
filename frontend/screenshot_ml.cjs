const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 1080 });

        const basePath = 'C:\\Users\\rafee\\.gemini\\antigravity\\brain\\f2dbc4ce-8adc-456a-a584-a255a865b5c6\\';

        console.log('Capturing Dashboard...');
        await page.goto('http://localhost:5173/');
        // Wait longer for the splash screen (3s) + animations
        await new Promise(r => setTimeout(r, 5000));
        await page.screenshot({ path: basePath + 'ml_dashboard.png', fullPage: true });

        console.log('Capturing FX Monitor...');
        await page.goto('http://localhost:5173/fx');
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: basePath + 'ml_fx_monitor.png', fullPage: true });

        await browser.close();
        console.log('Done!');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
