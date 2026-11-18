const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ls = { get(k, d) { try { return localStorage.getItem(k) ?? d } catch { return d } }, set(k, v) { try { localStorage.setItem(k, v) } catch {} } };
let D; try { D = JSON.parse(ls.get("siteData", "null")) || window.SITE_DATA } catch { D = window.SITE_DATA }
let lang = ls.get("lang", "uz");

const UI = {
  uz: { nav_home:"Bosh sahifa", nav_about:"Men haqimda", nav_resume:"Rezyume", nav_bots:"Botlar", nav_sites:"Saytlar", nav_contact:"Aloqa",
    btn_projects:"Loyihalarim", btn_contact:"Bog'lanish", stat_bots:"ta Telegram bot", stat_sites:"ta web sayt",
    skills_h:"Ko'nikmalar", exp_h:"Tajriba", empty:"Hali loyiha qo'shilmagan.", demo:"Ochish", exp_val:"6 oy",
    f_name:"Ismingiz", f_email:"Email manzilingiz", f_msg:"Xabaringiz", f_send:"Yuborish" },
  ru: { nav_home:"Главная", nav_about:"Обо мне", nav_resume:"Резюме", nav_bots:"Боты", nav_sites:"Сайты", nav_contact:"Контакты",
    btn_projects:"Мои проекты", btn_contact:"Связаться", stat_bots:"Telegram-ботов", stat_sites:"веб-сайтов",
    skills_h:"Навыки", exp_h:"Опыт", empty:"Проекты пока не добавлены.", demo:"Открыть", exp_val:"6 месяцев",
    f_name:"Ваше имя", f_email:"Ваш email", f_msg:"Сообщение", f_send:"Отправить" },
  en: { nav_home:"Home", nav_about:"About", nav_resume:"Resume", nav_bots:"Bots", nav_sites:"Websites", nav_contact:"Contact",
    btn_projects:"My projects", btn_contact:"Contact me", stat_bots:"Telegram bots", stat_sites:"websites",
    skills_h:"Skills", exp_h:"Experience", empty:"No projects added yet.", demo:"Open", exp_val:"6 months",
    f_name:"Your name", f_email:"Your email", f_msg:"Message", f_send:"Send" }
};
const tr = o => o ? (o[lang] || o.en || "") : "";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const ph = t => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00e599"/><stop offset="1" stop-color="#1ea7ff"/></linearGradient></defs><rect width="600" height="340" fill="#06120e"/><rect width="600" height="340" fill="url(#g)" opacity=".5"/><text x="300" y="185" font-family="sans-serif" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">${String(t).replace(/[<&]/g, "")}</text></svg>`);

function grid(type, el) {
  const list = D.projects.filter(p => p.type === type);
  el.innerHTML = list.length ? list.map(p => `
    <article class="card proj"><img src="${esc(p.image) || ph(p.title)}" alt="${esc(p.title)}" loading="lazy">
      <div class="pb"><h3>${esc(p.title)}</h3><p>${esc(tr(p.desc))}</p>
        <div class="btns">${p.github ? `<a class="btn sm" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}${p.demo ? `<a class="btn sm primary" href="${esc(p.demo)}" target="_blank" rel="noopener">${UI[lang].demo}</a>` : ""}</div></div>
    </article>`).join("") : `<p class="empty">${UI[lang].empty}</p>`;
  $$(".proj img", el).forEach((im, i) => im.addEventListener("error", () => { im.src = ph(list[i].title) }, { once: true }));
}

function render() {
  const t = UI[lang];
  document.documentElement.lang = lang;
  $$("[data-t]").forEach(e => e.textContent = t[e.dataset.t]);
  $$("[data-ph]").forEach(e => e.placeholder = t[e.dataset.ph]);
  $("#lang").value = lang;
  $("#name").textContent = D.name; $("#role").textContent = tr(D.role); $("#intro").textContent = tr(D.intro);
  $("#about").textContent = tr(D.about); $("#exp").textContent = tr(D.experience);
  $("#skills").innerHTML = D.skills.map(s => `<span>${esc(s)}</span>`).join("");
  const k = s => `<i class="k">"${s}"</i>`, v = s => `<i class="s">"${esc(s)}"</i>`;
  $("#term").innerHTML = `{\n  ${k("name")}: ${v(D.name.split(" ").map(w => w[0] + w.slice(1).toLowerCase()).join(" "))},\n  ${k("role")}: ${v(tr(D.role))},\n  ${k("stack")}: [${D.skills.slice(0, 4).map(v).join(", ")}],\n  ${k("experience")}: ${v(t.exp_val)}\n}`;
  $("#nBots").textContent = D.projects.filter(p => p.type === "bot").length;
  $("#nSites").textContent = D.projects.filter(p => p.type === "web").length;
  grid("bot", $("#botGrid")); grid("web", $("#siteGrid"));
  const c = D.contact;
  $("#tg").href = `https://t.me/${c.telegram}`; $("#tg span").textContent = "@" + c.telegram;
  $("#gh").href = `https://github.com/${c.github}`; $("#gh span").textContent = "github.com/" + c.github;
  $("#ml").href = `mailto:${c.email}`; $("#ml span").textContent = c.email;
  document.title = `${D.name} — ${tr(D.role)}`;
}

function theme(th) { document.documentElement.dataset.theme = th; $("#theme").textContent = th === "dark" ? "☾" : "☀"; ls.set("theme", th) }
$("#theme").onclick = () => theme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
$("#lang").onchange = e => { lang = e.target.value; ls.set("lang", lang); render() };
$("#burger").onclick = () => $("#menu").classList.toggle("open");
$$("#menu a").forEach(a => a.onclick = () => $("#menu").classList.remove("open"));
$("#form").onsubmit = e => {
  e.preventDefault();
  const body = `${$("#fMsg").value}\n\n— ${$("#fName").value} (${$("#fEmail").value})`;
  location.href = `mailto:${D.contact.email}?subject=${encodeURIComponent("Portfolio: " + $("#fName").value)}&body=${encodeURIComponent(body)}`;
  e.target.reset();
};
$("#year").textContent = new Date().getFullYear();
theme(ls.get("theme", "dark")); render();