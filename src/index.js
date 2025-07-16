export default {
  async fetch(request) {
    const urlParam = new URL(request.url).searchParams.get("url");

    if (!urlParam) {
      return new Response("Missing ?url= parameter", { status: 400 });
    }
    const upstreamURL = new URL(urlParam);
    const incomingHeaders = request.headers;
    const filteredHeaders = new Headers();
    for (const [key, value] of incomingHeaders.entries()) {
      if (!["host", "cf-connecting-ip", "cf-ipcountry", "cf-ray", "x-forwarded-for"].includes(key.toLowerCase())) {
        filteredHeaders.set(key, value);
      }
    }
    const upstreamResp = await fetch(upstreamURL.href, {
      method: request.method,
      headers: filteredHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      redirect: "follow"
    });

    const respHeaders = new Headers(upstreamResp.headers);
    respHeaders.set("Access-Control-Allow-Origin", "*");
    respHeaders.set("Access-Control-Allow-Credentials", "true");
    respHeaders.delete("content-security-policy");
    respHeaders.delete("content-security-policy-report-only");
    respHeaders.delete("clear-site-data");

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: respHeaders
    });
  }
}
