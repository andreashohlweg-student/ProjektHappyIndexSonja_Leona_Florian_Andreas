import {test,expect} from '@playwright/test';

test('Frontend startet ohne Fachseiten und Beispieldaten',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Frontend bereit'})).toBeVisible();
  await expect(page.getByRole('link',{name:'API-Vertrag in Swagger ansehen'})).toBeVisible();
  await expect(page.getByText('7,764')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Frontend bleibt auf dem Smartphone ohne Seitenüberlauf lesbar',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Frontend bereit'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});

test('Swagger dokumentiert Fachendpunkte; offene Aufgabe liefert 501',async({page})=>{
  await page.goto('/api/docs/');
  await expect(page.locator('.opblock')).toHaveCount(8);
  const years=page.locator('.opblock').filter({hasText:'/years'}).first();
  await years.locator('.opblock-summary').click();
  await years.getByRole('button',{name:'Try it out'}).click();
  await years.getByRole('button',{name:'Execute'}).click();
  await expect(years.locator('.live-responses-table')).toContainText('501');
  await expect(years.locator('.live-responses-table')).toContainText('NOT_IMPLEMENTED');
});
