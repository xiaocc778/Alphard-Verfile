const url = "https://www.auto-home.com.au/showroom/toyota-alphard-vellfire";
const html = await fetch(url).then((r) => r.text());

const idx = html.indexOf('href="/car-detail/');
console.log("firstCardIdx:", idx);
console.log(html.slice(idx, idx + 2500));

