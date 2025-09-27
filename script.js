/* =========================
   DATA USER & LOGIN
========================= */
const users = [
  { username: "aditya", password: "ashuraproject" },
  { username: "yakult", password: "161154" }
];

// Login
function login() {
  const uname = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const msg = document.getElementById("loginMsg");

  const user = users.find(u => u.username === uname && u.password === pass);
  if (user) {
      localStorage.setItem("loggedInUser", uname);
      window.location.href = "index.html";
  } else {
      msg.textContent = "Username atau password salah!";
  }
}

// Enter key login
document.addEventListener("keydown", function(e) {
  if(e.key === "Enter" && document.getElementById("loginform")) {
      login();
  }
});

// Check login
function checkLogin() {
  const user = localStorage.getItem("loggedInUser");
  if (!user) {
      window.location.href = "login.html";
  } else {
      document.getElementById("welcomeUser").textContent = `Selamat datang, ${user}`;
      showSplash(() => {
          document.getElementById("addEvent").style.display = "block";
          loadEvents();
      });
  }
}

// Logout
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

/* =========================
 SPLASH SCREEN
========================= */
function showSplash(callback) {
  const splash = document.getElementById("splash");
  splash.style.display = "flex";
  setTimeout(() => {
      splash.style.display = "none";
      if(callback) callback();
  }, 2500);
}

/* =========================
 EVENT & PENJUALAN
========================= */
let events = JSON.parse(localStorage.getItem("events")) || [];
let activeEventIndex = parseInt(localStorage.getItem("activeEventIndex")) || null;

function showEventForm() {
  const eventType = document.getElementById("eventType").value;
  document.getElementById("filmForm").style.display = "none";
  document.getElementById("otherForm").style.display = "none";

  if(eventType === "film") document.getElementById("filmForm").style.display = "block";
  if(eventType === "other") document.getElementById("otherForm").style.display = "block";
}

// Submit Film
function submitFilm() {
  const sekolah = document.getElementById("schoolName").value;
  const peserta = parseInt(document.getElementById("jumlahPeserta").value) || 0;
  const sample = parseInt(document.getElementById("sample").value) || 0;

  if(!sekolah || !peserta || !sample) { alert("Lengkapi semua data!"); return; }

  const newEvent = { nama: sekolah, lokasi:"-", saldoAwal:{YO:sample, OM:0, YT:0}, rekapTransaksi:[] };
  events.push(newEvent);
  saveEvents();
  loadEvents();
  setActiveEvent(events.length-1);
  showPenjualan();
}

// Submit Other Event
function submitEvent() {
  const nama = document.getElementById("namaEvent").value;
  const lokasi = document.getElementById("lokasiEvent").value;
  const saldoYO = parseInt(document.getElementById("saldoYO").value) || 0;
  const saldoOM = parseInt(document.getElementById("saldoOM").value) || 0;
  const saldoYT = parseInt(document.getElementById("saldoYT").value) || 0;

  if(!nama || !lokasi) { alert("Lengkapi semua data!"); return; }

  const newEvent = { nama, lokasi, saldoAwal:{YO:saldoYO, OM:saldoOM, YT:saldoYT}, rekapTransaksi:[] };
  events.push(newEvent);
  saveEvents();
  loadEvents();
  setActiveEvent(events.length-1);
  showPenjualan();
}

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function loadEvents() {
  const listDiv = document.getElementById("eventList");
  if(!listDiv) return;

  listDiv.innerHTML = "";
  events.forEach((ev, idx) => {
      const wrapper = document.createElement("div");
      wrapper.style.display="flex"; wrapper.style.marginBottom="5px";

      const btnEvent = document.createElement("button");
      btnEvent.textContent = ev.nama; btnEvent.classList.add("btnAction");
      btnEvent.onclick = ()=> setActiveEvent(idx);

      const btnDelete = document.createElement("button");
      btnDelete.textContent="Hapus"; btnDelete.classList.add("btnAction","delete");
      btnDelete.style.marginLeft="5px"; btnDelete.onclick = ()=> deleteEvent(idx);

      wrapper.appendChild(btnEvent);
      wrapper.appendChild(btnDelete);
      listDiv.appendChild(wrapper);
  });
}

function deleteEvent(idx){
  if(!confirm(`Hapus event "${events[idx].nama}"? Semua data akan hilang.`)) return;
  events.splice(idx,1); saveEvents(); loadEvents();
  if(activeEventIndex===idx) { activeEventIndex=null; localStorage.removeItem("activeEventIndex"); document.getElementById("main").style.display="none"; document.getElementById("addEvent").style.display="block"; }
}

function setActiveEvent(idx){
  activeEventIndex=idx; localStorage.setItem("activeEventIndex", idx);
  loadActiveEventData(); showPenjualan();
}

function loadActiveEventData(){
  if(activeEventIndex===null) return;
  const ev = events[activeEventIndex];
  document.querySelector("#main header").textContent = `Penjualan - ${ev.nama}`;

  // tampilkan saldo awal di sidebar
  document.getElementById("saldoAwalYO").textContent = ev.saldoAwal.YO;
  document.getElementById("saldoAwalOM").textContent = ev.saldoAwal.OM;
  document.getElementById("saldoAwalYT").textContent = ev.saldoAwal.YT;

  document.getElementById("yo").value=0; 
  document.getElementById("om").value=0; 
  document.getElementById("yt").value=0;
  updateHasil(); 
  updateRekap();
}


function showPenjualan(){
  document.getElementById("addEvent").style.display="none";
  document.getElementById("main").style.display="block";
}

/* =========================
 PENJUALAN
========================= */
function hitung(){
  if(activeEventIndex===null){ alert("Pilih event!"); return; }
  const ev = events[activeEventIndex];
  const hargaYO=2000, hargaOM=2100, hargaYT=2500;
  const yo=parseInt(document.getElementById("yo").value)||0;
  const om=parseInt(document.getElementById("om").value)||0;
  const yt=parseInt(document.getElementById("yt").value)||0;

  if(yo>ev.saldoAwal.YO || om>ev.saldoAwal.OM || yt>ev.saldoAwal.YT){ alert("Stok tidak cukup!"); return; }

  const total=yo*hargaYO + om*hargaOM + yt*hargaYT;
  ev.saldoAwal.YO-=yo; ev.saldoAwal.OM-=om; ev.saldoAwal.YT-=yt;
  ev.rekapTransaksi.push({YO:yo,OM:om,YT:yt,total});
  saveEvents();
  updateHasil(); 
  updateRekap();

    // Reset input kembali ke nol
    document.getElementById("yo").value = 0;
    document.getElementById("om").value = 0;
    document.getElementById("yt").value = 0;
}

function updateHasil(){
  if(activeEventIndex===null) return;
  const ev = events[activeEventIndex];
  document.getElementById("hasil").innerHTML=`<div class="saldoBox">Sisa Saldo → YO:${ev.saldoAwal.YO}, OM:${ev.saldoAwal.OM}, YT:${ev.saldoAwal.YT}</div>`;
}

function updateRekap(){
  if(activeEventIndex===null) return;
  const ev = events[activeEventIndex]; const tbody=document.querySelector("#rekapTable tbody");
  tbody.innerHTML="";
  ev.rekapTransaksi.forEach((trx,i)=>{
      const row=document.createElement("tr");
      row.innerHTML=`<td>${i+1}</td><td>${trx.YO}</td><td>${trx.OM}</td><td>${trx.YT}</td><td>Rp ${trx.total.toLocaleString()}</td>
      <td>
        <button class="btnAction" onclick="editTransaksi(${i})">Edit</button>
        <button class="btnAction delete" onclick="deleteTransaksi(${i})">Delete</button>
      </td>`;
      tbody.appendChild(row);
  });
}

// Edit/Delete transaksi
function editTransaksi(i){
  const ev=events[activeEventIndex]; const trx=ev.rekapTransaksi[i];
  ev.saldoAwal.YO+=trx.YO; ev.saldoAwal.OM+=trx.OM; ev.saldoAwal.YT+=trx.YT;
  document.getElementById("yo").value=trx.YO; document.getElementById("om").value=trx.OM; document.getElementById("yt").value=trx.YT;
  ev.rekapTransaksi.splice(i,1); saveEvents(); updateHasil(); updateRekap();
  alert("Edit jumlah di form, lalu klik Hitung Penjualan lagi.");
}

function deleteTransaksi(i){
  const ev=events[activeEventIndex]; const trx=ev.rekapTransaksi[i];
  ev.saldoAwal.YO+=trx.YO; ev.saldoAwal.OM+=trx.OM; ev.saldoAwal.YT+=trx.YT;
  ev.rekapTransaksi.splice(i,1); saveEvents(); updateHasil(); updateRekap();
  alert("Transaksi berhasil dihapus & stok dikembalikan!");
}

function resetRekap(){
  if(activeEventIndex===null) return; if(!confirm("Reset semua transaksi hari ini?")) return;
  const ev=events[activeEventIndex]; ev.rekapTransaksi=[]; ev.saldoAwal={YO:0,OM:0,YT:0};
  saveEvents(); updateRekap(); alert("Rekap transaksi berhasil direset!");
}

// Load event aktif saat buka halaman
if(activeEventIndex!==null){ loadActiveEventData(); showPenjualan(); }

function showTotalPage(){
  if(activeEventIndex === null){
    alert("Tidak ada event aktif!");
    return;
  }

  const ev = events[activeEventIndex];
  if (!ev) {
    alert("Event tidak ditemukan!");
    return;
  }

  document.getElementById("eventNameTotal").textContent = `Event: ${ev.nama}`;

  const harga = { YO:2000, OM:2100, YT:2500 };
  let totalYO=0, totalOM=0, totalYT=0;

  ev.rekapTransaksi.forEach(trx=>{
    totalYO+=trx.YO;
    totalOM+=trx.OM;
    totalYT+=trx.YT;
  });

  const tbody=document.querySelector("#totalTable tbody");
  tbody.innerHTML=`
    <tr><td>Yakult Ori</td><td>${totalYO}</td><td>Rp ${(totalYO*harga.YO).toLocaleString()}</td></tr>
    <tr><td>Yakult Mangga</td><td>${totalOM}</td><td>Rp ${(totalOM*harga.OM).toLocaleString()}</td></tr>
    <tr><td>Yakult Light</td><td>${totalYT}</td><td>Rp ${(totalYT*harga.YT).toLocaleString()}</td></tr>
    <tr class="totalRow"><td colspan="2">TOTAL</td><td>Rp ${((totalYO*harga.YO)+(totalOM*harga.OM)+(totalYT*harga.YT)).toLocaleString()}</td></tr>
  `;

  showPage("totalPage");
}


/* =========================
   PAGE NAVIGATION
========================= */
function showPage(pageId) {
  const pages = ["addEvent", "main", "totalPage"];
  pages.forEach(p => {
    document.getElementById(p).style.display = (p === pageId) ? "block" : "none";
  });
}
