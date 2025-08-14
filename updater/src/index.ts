import CookieManager from "./cookiesStore";
import { downloadWithProgress } from "./download";
import { fileExistsOnS3, uploadOnS3 } from "./s3";
import { getFileNameDatePart } from "./utils";
import { SKYB_LOGIN, SKYB_PASSWORD } from "./envVars";

const cookieFilter = [
  "JSESSIONID",
  "GUEST_LANGUAGE_ID",
  "consentCookie",
  "COOKIE_SUPPORT",
  "TS01c94574",
  "COMPANY_ID",
  "ID"
];

// Common headers for all requests
const baseHeaders = {
  "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
  "sec-ch-ua":
    '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-site": "same-origin"
};

// Common headers for document navigation (HTML pages)
const documentHeaders = {
  ...baseHeaders,
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1"
};

// Common headers for AJAX/API requests
const ajaxHeaders = {
  ...baseHeaders,
  accept: "*/*",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors"
};

const cookieMgr = new CookieManager();

async function signIn() {
  const initResponse = await fetch("https://www.skybriefing.com/fr/home", {
    headers: {
      ...documentHeaders,
      "cache-control": "max-age=0",
      Referer: "https://www.skybriefing.com/fr/home"
    },
    method: "GET"
  });

  cookieMgr.storeCookies(initResponse);

  const signInFormResponse = await fetch(
    "https://www.skybriefing.com/fr/signinnativ",
    {
      headers: {
        ...documentHeaders,
        cookie: cookieMgr.getFilteredCookies(cookieFilter),
        Referer: "https://www.skybriefing.com/fr/home"
      },
      method: "GET"
    }
  );

  cookieMgr.storeCookies(signInFormResponse);

  const pAuthRegex = /p_auth=([A-Za-z0-9]+)/;
  const timestampRegex =
    /id="_com_liferay_login_web_portlet_LoginPortlet_formDate"[^>]*value="(\d+)"/;
  const bodyText = await signInFormResponse.text();
  const pAuth = bodyText.match(pAuthRegex)?.[1];
  const timestamp = bodyText.match(timestampRegex)?.[1];

  if (!SKYB_LOGIN || !SKYB_PASSWORD) {
    throw new Error("EMAIL and PASSWORD environment variables are required");
  }

  const encodedEmail = encodeURIComponent(SKYB_LOGIN);
  const encodedPassword = encodeURIComponent(SKYB_PASSWORD);

  const response = await fetch(
    "https://www.skybriefing.com/fr/signinnativ?p_p_id=com_liferay_login_web_portlet_LoginPortlet&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&_com_liferay_login_web_portlet_LoginPortlet_javax.portlet.action=%2Flogin%2Flogin&_com_liferay_login_web_portlet_LoginPortlet_mvcRenderCommandName=%2Flogin%2Flogin",
    {
      headers: {
        ...documentHeaders,
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookieMgr.getFilteredCookies(cookieFilter),
        Referer: "https://www.skybriefing.com/fr/signinnativ"
      },
      body: `_com_liferay_login_web_portlet_LoginPortlet_formDate=${timestamp}&_com_liferay_login_web_portlet_LoginPortlet_saveLastPath=false&_com_liferay_login_web_portlet_LoginPortlet_redirect=&_com_liferay_login_web_portlet_LoginPortlet_doActionAfterLogin=false&_com_liferay_login_web_portlet_LoginPortlet_login=${encodedEmail}&_com_liferay_login_web_portlet_LoginPortlet_password=${encodedPassword}&p_auth=${pAuth}`,
      method: "POST",
      redirect: "manual"
    }
  );

  cookieMgr.storeCookies(response);
}

async function getActualVFRM() {
  const listManualRevsResponse = await fetch(
    "https://www.skybriefing.com/fr/evfr-manual?p_p_id=ch_skyguide_ibs_portal_downloadablecontent_eaip_portlet_evfrm_EVFRMUI&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=v-browserDetails&p_p_cacheability=cacheLevelPage&v-1755166595890",
    {
      headers: {
        ...ajaxHeaders,
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookieMgr.getFilteredCookies(cookieFilter),
        Referer: "https://www.skybriefing.com/fr/evfr-manual"
      },
      body: "v-browserDetails=1&theme=skb&v-appId=v-ch_skyguide_ibs_portal_downloadablecontent_eaip_portlet_evfrm_EVFRMUI_LAYOUT_489551&v-sh=1440&v-sw=2560&v-cw=734&v-ch=1270&v-curdate=1755166595890&v-tzo=-120&v-dstd=60&v-rtzo=-60&v-dston=true&v-tzid=Europe%2FZurich&v-vw=494&v-vh=0&v-loc=https%3A%2F%2Fwww.skybriefing.com%2Ffr%2Fevfr-manual&v-wn=v-ch_skyguide_ibs_portal_dabs_DabsUI_LAYOUT_10454-0.052364477651789976",
      method: "POST"
    }
  );

  const url = `https://www.skybriefing.com${
    (await listManualRevsResponse.text()).match(/\/o\/eAIP\/eVFRM\/\d{6}/g)?.[0]
  }/VFRM.pdf`;

  return { url, rev: `${getFileNameDatePart(url)}` };
}

async function downloadActualVFRM(downloadUrl: string) {
  console.log(`Attempting to download PDF from: ${downloadUrl}`);

  return downloadWithProgress(downloadUrl, {
    ...baseHeaders,
    accept: "application/pdf,*/*",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-user": "?1",
    Referer: "https://www.skybriefing.com/fr/evfr-manual",
    cookie: cookieMgr.getFilteredCookies(cookieFilter)
  });
}

async function main() {
  await signIn();
  const { url, rev } = await getActualVFRM();
  if (!url) throw new Error("Failed to retrieve VFRM URL");
  const filename = `${rev}.pdf`;
  if (await fileExistsOnS3(filename)) {
    console.log(
      `The most recent revision (${rev}) is already uploaded into the S3 bucket!`
    );
    return;
  }
  const pdfBuffer = await downloadActualVFRM(url);

  console.log(
    `Downloaded PDF buffer: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`
  );

  await uploadOnS3(filename, pdfBuffer);

  return pdfBuffer;
}

await main();

export {};
