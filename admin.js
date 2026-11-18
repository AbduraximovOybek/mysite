const $ = (s, r = document) => r.querySelector(s);
const ls = { get(k, d) { try { return localStorage.getItem(k) ?? d } catch { return d } }, set(k, v) { try { localStorage.setItem(k, v) } catch {} }, del(k) { try { localStorage.removeItem(k) } catch {} } };
let D; try { D = JSON.parse(ls.get("siteData", "null")) || structuredClone(window.SITE_DATA) } catch { D = structuredClone(window.SITE_DATA) }
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const say = t => { $("#msg").textContent = t; setTimeout(() => $("#msg").textContent = "", 3000) };
const save = () => { ls.set("siteData", JSON.stringify(D)); say("Saqlandi ✓") };

/* ---- Parol (faqat shu brauzer uchun qulf) ---- */
async function hash(s) {
  if (window.crypto?.subtle) return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, "0")).join("");
  let h = 5381; for (const c of s) h = (h * 33) ^ c.charCodeAt(0); return String(h >>> 0);
}
const stored = () => ls.get("adminHash", "");
function gateInit() {
  const first = !stored();
  $("#gateT").textContent = first ? "Admin parol yarating" : "Admin panelga kirish";
  $("#pw").placeholder = first ? "Kamida 4 ta belgi" : "Parol";
  $("#gateBtn").textContent = first ? "Parolni saqlash" : "Kirish";
}
$("#gateBtn").onclick = async () => {
  const pw = $("#pw").value, h = stored();
  if (!h) { if (pw.length < 4) return $("#gateMsg").textContent = "Parol kamida 4 ta belgidan iborat bo'lsin."; ls.set("adminHash", await hash(pw)); return open(); }
  if (await hash(pw) === h) open(); else $("#gateMsg").textContent = "Parol noto'g'ri.";
};
$("#pw").onkeydown = e => { if (e.key === "Enter") $("#gateBtn").click() };
const open = () => { sessionStorage.setItem("adm", "1"); $("#gate").hidden = true; $("#panel").hidden = false; renderAll() };
$("#logout").onclick = () => { sessionStorage.removeItem("adm"); location.reload() };
$("#chpw").onclick = () => { ls.del("adminHash"); sessionStorage.removeItem("adm"); location.reload() };

/* ---- Profil formasi ---- */
const SPEC = [["Ism", "name"], ["Lavozim (UZ)", "role.uz"], ["Lavozim (RU)", "role.ru"], ["Lavozim (EN)", "role.en"],
  ["Qisqa kirish (UZ)", "intro.uz", 1], ["Qisqa kirish (RU)", "intro.ru", 1], ["Qisqa kirish (EN)", "intro.en", 1],
  ["Men haqimda (UZ)", "about.uz", 1], ["Men haqimda (RU)", "about.ru", 1], ["Men haqimda (EN)", "about.en", 1],
  ["Tajriba (UZ)", "experience.uz", 1], ["Tajriba (RU)", "experience.ru", 1], ["Tajriba (EN)", "experience.en", 1],
  ["Ko'nikmalar (vergul bilan ajrating)", "skills"],
  ["Telegram username (@ siz)", "contact.telegram"], ["GitHub username", "contact.github"], ["Email", "contact.email"]];
const get = p => p.split(".").reduce((o, k) => o?.[k], D);
const set = (p, v) => { const ks = p.split("."), l = ks.pop(); ks.reduce((o, k) => o[k], D)[l] = v };
function renderProfile() {
  $("#profile").innerHTML = SPEC.map(([l, p, ta]) => {
    const v = p === "skills" ? D.skills.join(", ") : get(p);
    return `<label class="f">${l}${ta ? `<textarea data-p="${p}" rows="2">${esc(v)}</textarea>` : `<input data-p="${p}" value="${esc(v)}">`}</label>`;
  }).join("");
}
$("#saveProfile").onclick = () => {
  document.querySelectorAll("[data-p]").forEach(e => set(e.dataset.p, e.dataset.p === "skills" ? e.value.split(",").map(s => s.trim()).filter(Boolean) : e.value.trim()));
  save();
};

/* ---- Loyihalar ---- */
let editId = null;
function renderList() {
  $("#pList").innerHTML = D.projects.length ? D.projects.map(p => `
    <div class="row"><div><b>${esc(p.title)}</b><br><small>${p.type === "bot" ? "Telegram bot" : "Web sayt"}</small></div>
    <div class="btns"><button class="btn sm" data-e="${p.id}">Tahrirlash</button><button class="btn sm" data-d="${p.id}">O'chirish</button></div></div>`).join("")
    : "<p class='warn'>Hali loyiha yo'q. Yuqoridagi formadan qo'shing.</p>";
  document.querySelectorAll("[data-e]").forEach(b => b.onclick = () => edit(+b.dataset.e));
  document.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { if (confirm("Loyiha o'chirilsinmi?")) { D.projects = D.projects.filter(p => p.id !== +b.dataset.d); save(); renderList() } });
}
function edit(id) {
  const p = D.projects.find(x => x.id === id); editId = id;
  $("#pType").value = p.type; $("#pTitle").value = p.title; $("#pUz").value = p.desc?.uz || ""; $("#pRu").value = p.desc?.ru || ""; $("#pEn").value = p.desc?.en || "";
  $("#pImg").value = p.image?.startsWith("data:") ? "" : p.image || ""; $("#pGit").value = p.github || ""; $("#pDemo").value = p.demo || "";
  $("#pSave").textContent = "Yangilash"; $("#pCancel").hidden = false; $("#pForm").scrollIntoView({ behavior: "smooth" });
}
function clearForm() { editId = null; $("#pForm").reset(); $("#pSave").textContent = "Qo'shish"; $("#pCancel").hidden = true; imgData = "" }
$("#pCancel").onclick = clearForm;
let imgData = "";
$("#pFile").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => {
    const k = Math.min(1, 800 / im.width), c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k;
    c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); imgData = c.toDataURL("image/jpeg", .8); say("Rasm tayyor ✓");
  }; im.src = r.result }; r.readAsDataURL(f);
};
$("#pForm").onsubmit = e => {
  e.preventDefault();
  const old = D.projects.find(p => p.id === editId);
  const p = { id: editId ?? Date.now(), type: $("#pType").value, title: $("#pTitle").value.trim(),
    desc: { uz: $("#pUz").value.trim(), ru: $("#pRu").value.trim(), en: $("#pEn").value.trim() },
    image: imgData || $("#pImg").value.trim() || (old?.image?.startsWith("data:") ? old.image : ""),
    github: $("#pGit").value.trim(), demo: $("#pDemo").value.trim() };
  D.projects = editId ? D.projects.map(x => x.id === editId ? p : x) : [...D.projects, p];
  save(); clearForm(); renderList();
};

/* ---- Eksport / qayta tiklash ---- */
$("#export").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([`/* Sayt ma'lumotlari */\nwindow.SITE_DATA = ${JSON.stringify(D, null, 2)};\n`], { type: "text/javascript" }));
  a.download = "data.js"; a.click(); URL.revokeObjectURL(a.href);
};
$("#reset").onclick = () => { if (confirm("Shu brauzerdagi barcha o'zgarishlar o'chirilsinmi?")) { ls.del("siteData"); location.reload() } };

function renderAll() { renderProfile(); renderList() }
gateInit();
if (sessionStorage.getItem("adm") && stored()) open();