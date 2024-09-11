import puppeteer from "puppeteer";
import { getDatePart } from "./utils.js";

export async function fetchManuals(revToSkip: (string | undefined)[]) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    timeout: 0,
    headless: false,
    executablePath: "/usr/bin/google-chrome-stable",
    userDataDir: "/tmp/puppeteer-chrome-session",
    args: ["--disable-web-security"]
  });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate the page to a URL
  await page.goto("https://www.skybriefing.com/fr/signinnativ");

  if (
    await page.evaluate(() =>
      Boolean(
        document.querySelector(
          "#_com_liferay_login_web_portlet_LoginPortlet_login"
        )
      )
    )
  ) {
    // Type into search box
    await page.type(
      "#_com_liferay_login_web_portlet_LoginPortlet_login",
      "wsu287@gmail.com"
    );
    await page.type(
      "#_com_liferay_login_web_portlet_LoginPortlet_password",
      "V5Lvn547SVsgqCu"
    );
    await page.click("button[type=submit]");
    await page.waitForNavigation();
  }

  await page.goto("https://www.skybriefing.com/fr/evfr-manual");

  await new Promise(resolve => {
    const interval = setInterval(async () => {
      const isvisible = await page.evaluate(() => {
        const h1 = Array.from(document.querySelectorAll("h1")).find(
          h => h.textContent?.trim() === "eAIP AIRAC cycles disponibles"
        );
        return !!h1; // Convert to boolean: true if found, false otherwise
      });

      if (isvisible) {
        clearInterval(interval);
        resolve(true);
      }
    }, 500);
  });

  const links = Array.from(
    new Set(
      await page.evaluate(() => {
        const links = document.querySelectorAll("a"); // Get all <a> elements
        return Array.from(links)
          .filter(link => link.href.includes("/o/eAIP/eVFRM"))
          .map(link => link.href);
      })
    )
  );

  await Promise.all(
    links.map(async link => {
      const datePart = getDatePart(link);
      if (revToSkip.includes(datePart)) return;
      if (datePart) {
        return page.evaluate(async datePart => {
          console.info(`Retrieving VFR manual v ${datePart}`);
          const res = await fetch(
            `https://www.skybriefing.com/o/eAIP/eVFRM/${datePart}/VFRM.pdf`,
            {
              method: "GET",
              credentials: "include"
            }
          );

          const arrayBuffer = await res.arrayBuffer();
          console.info(`Uploading VFR manual v ${datePart}`);
          await fetch("http://localhost:3000/upload-pdf", {
            method: "POST",
            headers: {
              "Content-Type": "application/pdf",
              Link: `https://www.skybriefing.com/o/eAIP/eVFRM/${datePart}/VFRM.pdf`
            },
            body: arrayBuffer
          });
          console.info(`VFR manual v ${datePart} upload complete`);
        }, datePart);
      }
    })
  );

  await browser.close();
}
