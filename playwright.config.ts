import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',timeout:30000,workers:1,
  use:{baseURL:'http://127.0.0.1:5173',headless:true,viewport:{width:1440,height:1050},screenshot:'only-on-failure',
    launchOptions:process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}:{}},
  webServer:[
    {command:'npm run dev:api',url:'http://127.0.0.1:3001/api/meta',reuseExistingServer:!process.env.CI,timeout:30000},
    {command:'npm run dev -w @happiness/web -- --host 127.0.0.1',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:30000},
  ],
});
