// Get banner element
const getBannerElement = () => document.querySelector('#previewArea .banner');

// DOM Elements
const grid = document.getElementById('grid');
const filter = document.getElementById('filter');
const category = document.getElementById('category');
const title = document.getElementById('title');
const tag = document.getElementById('tag');
const timeIn = document.getElementById('time');
const venue = document.getElementById('venue');
const contact = document.getElementById('contact');
const orientation = document.getElementById('orientation');
const aiBtn = document.getElementById('aiBtn');
const previewBtn = document.getElementById('previewBtn');
const createBtn = document.getElementById('createBtn');
const downloadBtn = document.getElementById('downloadBtn');
const bgUpload = document.getElementById('bgUpload');
const logoUpload = document.getElementById('logoUpload');
const previewArea = document.getElementById('previewArea');
const generateBtn = document.getElementById('generateBtn'); // Optional QR preview button
const qrPreview = document.getElementById('qrPreview');

let templates = [];
let uploadedBg = null;
let uploadedLogo = null;
let selectedTemplate = null;
let latestQR = ""; // store QR from backend

// Load templates
fetch('/templates/templates.json')
  .then(res => res.json())
  .then(data => {
    templates = data.templates;
    populateTemplates();
  });

// Populate template grid
function populateTemplates() {
  grid.innerHTML = "";
  filter.innerHTML = `<option value="">All</option>`;

  const cats = [...new Set(templates.map(t => t.category))];
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    filter.appendChild(opt);
  });

  templates.forEach(t => addTemplate(t));
  selectTemplate(templates[0]);
}

function addTemplate(t) {
  const div = document.createElement('div');
  div.className = "tpl";

  const img = document.createElement('img');
  img.src = "/templates/" + t.file;

  div.appendChild(img);
  div.onclick = () => selectTemplate(t);

  grid.appendChild(div);
}

function selectTemplate(t) {
  selectedTemplate = t;
  category.value = t.category;
  renderPreview();
}

// Filter templates
filter.addEventListener("change", () => {
  const sel = filter.value;
  grid.innerHTML = "";
  templates
    .filter(t => !sel || t.category === sel)
    .forEach(addTemplate);
});

// Upload Background
bgUpload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    uploadedBg = reader.result;
    renderPreview();
  };
  reader.readAsDataURL(file);
});

// Upload Logo
logoUpload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    uploadedLogo = reader.result;
    renderPreview();
  };
  reader.readAsDataURL(file);
});

// AI Autofill
aiBtn.addEventListener("click", () => {
  if (!title.value) title.value = `${category.value} Event`;
  if (!tag.value) tag.value = "Don't miss out!";
  if (!timeIn.value) timeIn.value = "Sat, Dec 6 · 7 PM";

  renderPreview();
});

// Preview Button
previewBtn.addEventListener("click", () => renderPreview(latestQR));

// ----------------------
// RENDER PREVIEW
// ----------------------
function renderPreview(qrBase64 = "") {
  previewArea.innerHTML = "";
  if (!selectedTemplate) return;

  const banner = document.createElement("div");
  banner.className = "banner " + (orientation.value === "landscape" ? "land" : "");
  banner.style.position = "relative";

  // Background
  banner.style.background = `url(/templates/${selectedTemplate.file}) center/cover no-repeat`;
  if (uploadedBg) banner.style.background = `url(${uploadedBg}) center/cover no-repeat`;

  // Text
  const left = document.createElement("div");
  left.className = "leftText";
  left.innerHTML = `
      <h3>${title.value}</h3>
      <p>${tag.value}</p>
      <p>${timeIn.value} • ${venue.value}</p>
      <p>${contact.value}</p>
  `;

  // QR
  const right = document.createElement("div");
  right.className = "rightBox";

  const qrBox = document.createElement("div");
  qrBox.className = "qr";

  if (qrBase64) {
    const img = new Image();
    img.src = qrBase64;
    img.style.width = "100%";
    qrBox.appendChild(img);
  } else {
    qrBox.innerHTML = "<small>QR</small>";
  }

  // Logo
  if (uploadedLogo) {
    const logo = new Image();
    logo.src = uploadedLogo;
    logo.className = "logoImg";
    banner.appendChild(logo);
  }

  right.appendChild(qrBox);
  banner.appendChild(left);
  banner.appendChild(right);

  previewArea.appendChild(banner);
}

// ----------------------
// CREATE EVENT + GET QR
// ----------------------
createBtn.addEventListener("click", async () => {
  const response = await fetch("/create-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.value,
      tag: tag.value,
      time: timeIn.value,
      venue: venue.value,
      contact: contact.value,
      category: category.value
    })
  });

  const data = await response.json();
  if (!data.ok) return alert("Failed to create event");

  latestQR = data.qr;
  renderPreview(latestQR);

  alert("Event Created! QR ready.");
});

// ----------------------
// DOWNLOAD PNG
// ----------------------
downloadBtn.addEventListener("click", async () => {
  const banner = getBannerElement();
  if (!banner) return alert("Preview first!");

  const canvas = await html2canvas(banner, { scale: 2 });
  const a = document.createElement("a");
  a.download = `${title.value || "event"}-banner.png`;
  a.href = canvas.toDataURL();
  a.click();
});

// ----------------------
// OPTIONAL: Generate QR Preview Only
// ----------------------
if (generateBtn && qrPreview) {
  generateBtn.addEventListener("click", async () => {
    const sendData = {
      title: title.value,
      tag: tag.value,
      time: timeIn.value,
      venue: venue.value,
      contact: contact.value
    };

    const res = await fetch("/create-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendData)
    });

    const data = await res.json();

    if (data.ok) {
      qrPreview.src = data.qr;
      qrPreview.style.display = "block";
    } else {
      alert("QR failed");
    }
  });
}
