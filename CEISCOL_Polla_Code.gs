// ╔══════════════════════════════════════════════════════════╗
// ║   POLLA MUNDIALISTA CEISCOL 2026 — TODO EN UN ARCHIVO   ║
// ║   Sirve el formulario + guarda datos + envía correos     ║
// ╚══════════════════════════════════════════════════════════╝
//
// INSTRUCCIONES RÁPIDAS:
// 1. Abre script.google.com con ceiscol.asistente@gmail.com
// 2. Nuevo proyecto → borra todo → pega este código
// 3. Reemplaza SHEET_ID con el ID de tu Google Sheet
// 4. Implementar → Nueva implementación → Aplicación web
//    • Ejecutar como: Yo
//    • Acceso: Cualquier persona (incluso anónimos)
// 5. Copia la URL y créale un link corto en bit.ly/pollaceiscol

const SHEET_ID     = 'TU_SHEET_ID_AQUI';          // ← cambia esto
const NOTIFY_EMAIL = 'ceiscol.asistente@gmail.com';

// ── Sirve el formulario HTML ──────────────────────────────────
function doGet() {
  return HtmlService
    .createHtmlOutput(getHTML())
    .setTitle('Polla Mundialista CEISCOL 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── Recibe el formulario y procesa ───────────────────────────
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    guardarEnSheet(d);
    enviarCorreos(d);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, msg: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Guardar en Google Sheet ───────────────────────────────────
function guardarEnSheet(d) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh   = ss.getSheetByName('Registros');

  if (!sh) {
    sh = ss.insertSheet('Registros');
    const h = ['Fecha','Laboratorio','Ciudad','Nombres','Apellidos',
                'Documento','Celular','Correo','Goles COL','Goles POR','Marcador'];
    sh.appendRow(h);
    sh.getRange(1,1,1,h.length)
      .setFontWeight('bold')
      .setBackground('#003087')
      .setFontColor('#FFD700');
    sh.setFrozenRows(1);
  }

  sh.appendRow([
    d.fecha, d.laboratorio, d.ciudad,
    d.nombres, d.apellidos, d.documento,
    d.celular, d.email,
    d.col, d.por, d.marcador
  ]);
  sh.autoResizeColumns(1, 11);
}

// ── Enviar correos ────────────────────────────────────────────
function enviarCorreos(d) {
  // A CEISCOL
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `⚽ Nuevo registro Polla CEISCOL — ${d.nombres} ${d.apellidos}`,
    htmlBody: `<div style="font-family:Arial;max-width:560px;">
      <div style="background:#003087;padding:24px;text-align:center;">
        <h2 style="color:#FFD700;margin:0;">🏆 Polla Mundialista CEISCOL 2026</h2>
        <p style="color:#fff;opacity:.7;font-size:13px;margin:6px 0 0;">Nuevo participante</p>
      </div>
      <div style="padding:24px;background:#fff;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#f5f7ff"><td style="padding:10px;color:#555;"><b>Laboratorio</b></td><td style="padding:10px;">${d.laboratorio}</td></tr>
          <tr><td style="padding:10px;color:#555;"><b>Ciudad</b></td><td style="padding:10px;">${d.ciudad}</td></tr>
          <tr style="background:#f5f7ff"><td style="padding:10px;color:#555;"><b>Bacteriólogo</b></td><td style="padding:10px;">${d.nombres} ${d.apellidos}</td></tr>
          <tr><td style="padding:10px;color:#555;"><b>Documento</b></td><td style="padding:10px;">${d.documento}</td></tr>
          <tr style="background:#f5f7ff"><td style="padding:10px;color:#555;"><b>Celular</b></td><td style="padding:10px;">${d.celular}</td></tr>
          <tr><td style="padding:10px;color:#555;"><b>Correo</b></td><td style="padding:10px;">${d.email}</td></tr>
        </table>
        <div style="background:#003087;border-radius:10px;padding:20px;text-align:center;margin-top:20px;">
          <p style="color:rgba(255,255,255,.6);font-size:12px;margin:0 0 8px;">PRONÓSTICO REGISTRADO</p>
          <p style="color:#FFD700;font-size:34px;font-weight:bold;margin:0;">🇨🇴 ${d.col} – ${d.por} 🇵🇹</p>
          <p style="color:rgba(255,255,255,.5);font-size:12px;margin:8px 0 0;">Colombia vs Portugal</p>
        </div>
        <p style="color:#aaa;font-size:11px;margin-top:16px;text-align:center;">${d.fecha}</p>
      </div>
    </div>`
  });

  // Al bacteriólogo
  MailApp.sendEmail({
    to: d.email,
    subject: '✅ ¡Registro exitoso! Polla Mundialista CEISCOL 2026',
    htmlBody: `<div style="font-family:Arial;max-width:520px;">
      <div style="background:#003087;padding:28px;text-align:center;">
        <p style="font-size:44px;margin:0;">🇨🇴</p>
        <h2 style="color:#FFD700;margin:10px 0 0;">¡Ya estás en la polla!</h2>
        <p style="color:rgba(255,255,255,.7);font-size:13px;margin:4px 0 0;">Polla Mundialista CEISCOL 2026</p>
      </div>
      <div style="padding:24px;background:#fff;">
        <p style="font-size:15px;color:#333;">Hola <b>${d.nombres}</b>,</p>
        <p style="font-size:14px;color:#555;line-height:1.6;">Tu pronóstico fue guardado correctamente. ¡Buena suerte!</p>
        <div style="background:#f0f4ff;border-left:4px solid #003087;border-radius:0 8px 8px 0;padding:16px;margin:20px 0;">
          <p style="color:#003087;font-size:13px;margin:0 0 8px;"><b>Tu marcador:</b></p>
          <p style="font-size:28px;font-weight:bold;color:#003087;margin:0;">🇨🇴 ${d.col} – ${d.por} 🇵🇹</p>
          <p style="font-size:12px;color:#888;margin:6px 0 0;">Colombia vs Portugal</p>
        </div>
        <p style="font-size:13px;color:#555;">Laboratorio: <b>${d.laboratorio}</b></p>
        <p style="font-size:12px;color:#aaa;margin-top:16px;">¡Vamos Colombia! ⚽</p>
      </div>
      <div style="background:#f8f9ff;padding:12px;text-align:center;">
        <p style="font-size:11px;color:#bbb;margin:0;">CEISCOL • Polla Mundialista 2026</p>
      </div>
    </div>`
  });
}

// ── HTML del formulario (inline) ──────────────────────────────
function getHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Polla Mundialista CEISCOL 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Roboto',sans-serif;background:#0a0e1a;min-height:100vh;color:#e0e6f0;
  background-image:radial-gradient(ellipse at top left,rgba(255,215,0,.06) 0%,transparent 50%),
  radial-gradient(ellipse at bottom right,rgba(0,80,200,.08) 0%,transparent 50%);}
.hero{background:linear-gradient(135deg,#003087 0%,#001a5e 40%,#0a0e1a 100%);
  padding:32px 20px 52px;text-align:center;position:relative;overflow:hidden;
  border-bottom:2px solid rgba(255,215,0,.3);}
.hero::before{content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(45deg,rgba(255,255,255,.015) 0px,rgba(255,255,255,.015) 1px,transparent 1px,transparent 12px);}
.badge{display:inline-block;background:linear-gradient(90deg,#ffd700,#ffb300);color:#0a0e1a;
  font-family:'Oswald',sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;
  padding:4px 14px;border-radius:20px;text-transform:uppercase;margin-bottom:14px;}
.hero h1{font-family:'Oswald',sans-serif;font-size:clamp(26px,7vw,50px);font-weight:700;
  letter-spacing:1px;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.5);line-height:1.15;}
.hero h1 span{color:#ffd700;}
.hero p.sub{margin-top:10px;font-size:13px;color:rgba(255,255,255,.55);letter-spacing:1px;text-transform:uppercase;}
.wrap{max-width:660px;margin:0 auto;padding:0 16px;}
.card{background:linear-gradient(145deg,#111827,#1a2236);border:1px solid rgba(255,215,0,.18);
  border-radius:16px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,.6);}
.match-card{margin:-26px auto 0;position:relative;z-index:10;}
.match-header{text-align:center;font-size:11px;color:rgba(255,215,0,.85);letter-spacing:3px;
  text-transform:uppercase;font-weight:500;margin-bottom:20px;}
.teams{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.team{flex:1;text-align:center;}
.flag{font-size:50px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4));}
.team-name{font-family:'Oswald',sans-serif;font-size:17px;font-weight:600;color:#fff;margin-top:8px;letter-spacing:1px;}
.vs-badge{background:linear-gradient(135deg,#ffd700,#ffb300);color:#0a0e1a;
  font-family:'Oswald',sans-serif;font-size:20px;font-weight:700;width:46px;height:46px;
  border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 0 20px rgba(255,215,0,.3);}
.score-section{margin-top:28px;}
.score-label{text-align:center;font-size:11px;color:rgba(255,215,0,.9);letter-spacing:2px;
  text-transform:uppercase;font-weight:500;margin-bottom:16px;}
.score-row{display:flex;align-items:center;justify-content:center;gap:16px;}
.stl{font-family:'Oswald',sans-serif;font-size:13px;color:rgba(255,255,255,.55);text-align:center;width:78px;}
.sp{display:flex;flex-direction:column;align-items:center;}
.sb{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#ffd700;
  font-size:16px;width:44px;height:30px;cursor:pointer;transition:all .15s;
  display:flex;align-items:center;justify-content:center;font-weight:700;user-select:none;}
.sb:hover{background:rgba(255,215,0,.15);border-color:rgba(255,215,0,.4);}
.sb.up{border-radius:6px 6px 0 0;margin-bottom:-1px;}
.sb.dn{border-radius:0 0 6px 6px;margin-top:-1px;}
.sd{background:#0a0e1a;border:2px solid rgba(255,215,0,.5);color:#ffd700;
  font-family:'Oswald',sans-serif;font-size:34px;font-weight:700;width:66px;height:66px;
  text-align:center;display:flex;align-items:center;justify-content:center;
  border-radius:8px;box-shadow:0 0 20px rgba(255,215,0,.1),inset 0 2px 6px rgba(0,0,0,.4);}
.sep{font-family:'Oswald',sans-serif;font-size:30px;font-weight:700;
  color:rgba(255,255,255,.25);padding:0 4px;margin-top:30px;}
.chips{display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap;}
.chip{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:8px;
  padding:6px 12px;cursor:pointer;transition:all .15s;text-align:center;min-width:52px;}
.chip:hover{background:rgba(255,215,0,.12);border-color:rgba(255,215,0,.4);}
.chip .cv{font-family:'Oswald',sans-serif;font-size:15px;font-weight:600;color:#fff;}
.chip .cl{font-size:10px;color:rgba(255,255,255,.4);display:block;margin-top:2px;}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,.2),transparent);margin:22px 0;}
.form-card{margin-top:20px;}
.stitle{font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:2.5px;color:#ffd700;
  text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.stitle::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(255,215,0,.3),transparent);}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:500px){.grid{grid-template-columns:1fr;}}
.f{display:flex;flex-direction:column;gap:6px;}
.f.full{grid-column:1/-1;}
label{font-size:11px;font-weight:500;color:rgba(255,255,255,.45);letter-spacing:1px;text-transform:uppercase;}
label .r{color:#ffd700;margin-left:2px;}
input,select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);
  border-radius:8px;color:#e0e6f0;font-size:14px;padding:11px 14px;
  transition:border-color .2s,box-shadow .2s;width:100%;font-family:'Roboto',sans-serif;}
select option{background:#1a2236;}
input::placeholder{color:rgba(255,255,255,.2);}
input:focus,select:focus{outline:none;border-color:rgba(255,215,0,.5);
  box-shadow:0 0 0 3px rgba(255,215,0,.08);background:rgba(255,255,255,.06);}
input.err{border-color:#ff4757;}
.terms{display:flex;align-items:flex-start;gap:10px;margin-top:4px;}
.terms input[type=checkbox]{width:18px;height:18px;min-width:18px;accent-color:#ffd700;margin-top:2px;cursor:pointer;}
.terms label{text-transform:none;letter-spacing:0;font-size:12px;color:rgba(255,255,255,.4);line-height:1.5;}
.btn{width:100%;padding:16px;background:linear-gradient(90deg,#ffd700,#ffb300);color:#0a0e1a;
  border:none;border-radius:10px;font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;
  letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;
  margin-top:22px;box-shadow:0 4px 20px rgba(255,215,0,.25);}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,215,0,.4);}
.btn:active{transform:translateY(0);}
.btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.spin{display:none;width:20px;height:20px;border:3px solid rgba(0,0,0,.2);
  border-top-color:#0a0e1a;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto;}
@keyframes spin{to{transform:rotate(360deg)}}
.alert{border-radius:10px;padding:16px 18px;font-size:14px;line-height:1.5;margin-top:14px;display:none;}
.ok{background:rgba(0,200,100,.1);border:1px solid rgba(0,200,100,.3);color:#00c864;}
.nok{background:rgba(255,71,87,.1);border:1px solid rgba(255,71,87,.3);color:#ff4757;}
footer{text-align:center;padding:28px 20px;font-size:11px;color:rgba(255,255,255,.2);letter-spacing:1px;}
footer strong{color:rgba(255,215,0,.4);}
</style>
</head>
<body>
<div class="hero">
  <div style="position:relative;z-index:1;">
    <div class="badge">&#9917; Copa Mundo 2026 &nbsp;|&nbsp; CEISCOL</div>
    <h1>POLLA MUNDIALISTA<br><span>CEISCOL</span></h1>
    <p class="sub">Registra tu pron&#243;stico &bull; Colombia vs Portugal</p>
  </div>
</div>

<div class="wrap">

<!-- Tarjeta marcador -->
<div class="card match-card">
  <div class="match-header">&#127942; ELIGE TU MARCADOR FINAL</div>
  <div class="teams">
    <div class="team"><div class="flag">&#127464;&#127476;</div><div class="team-name">COLOMBIA</div></div>
    <div class="vs-badge">VS</div>
    <div class="team"><div class="flag">&#127477;&#127481;</div><div class="team-name">PORTUGAL</div></div>
  </div>
  <div class="score-section">
    <div class="score-label">&#128073; Ajusta el resultado con las flechas</div>
    <div class="score-row">
      <div class="stl">&#127464;&#127476;<br>Colombia</div>
      <div class="sp">
        <button class="sb up" onclick="ch('c',1)">&#9650;</button>
        <div class="sd" id="sc">0</div>
        <button class="sb dn" onclick="ch('c',-1)">&#9660;</button>
      </div>
      <div class="sep">&#8211;</div>
      <div class="sp">
        <button class="sb up" onclick="ch('p',1)">&#9650;</button>
        <div class="sd" id="sp">0</div>
        <button class="sb dn" onclick="ch('p',-1)">&#9660;</button>
      </div>
      <div class="stl">&#127477;&#127481;<br>Portugal</div>
    </div>
    <div class="chips">
      <div class="chip" onclick="ss(1,0)"><span class="cv">1&#8209;0</span><span class="cl">Colombia</span></div>
      <div class="chip" onclick="ss(2,0)"><span class="cv">2&#8209;0</span><span class="cl">Colombia</span></div>
      <div class="chip" onclick="ss(2,1)"><span class="cv">2&#8209;1</span><span class="cl">Colombia</span></div>
      <div class="chip" onclick="ss(1,1)"><span class="cv">1&#8209;1</span><span class="cl">Empate</span></div>
      <div class="chip" onclick="ss(0,1)"><span class="cv">0&#8209;1</span><span class="cl">Portugal</span></div>
      <div class="chip" onclick="ss(1,2)"><span class="cv">1&#8209;2</span><span class="cl">Portugal</span></div>
    </div>
  </div>
</div>

<!-- Formulario -->
<div class="card form-card">
  <form id="frm" novalidate>
    <div class="stitle">Datos del Laboratorio</div>
    <div class="grid">
      <div class="f full">
        <label>Nombre del Laboratorio <span class="r">*</span></label>
        <input type="text" id="lab" placeholder="Ej. Laboratorio Cl&#237;nico San Rafael" required/>
      </div>
      <div class="f full">
        <label>Ciudad / Municipio <span class="r">*</span></label>
        <input type="text" id="ciu" placeholder="Ej. Bogot&#225;, Medell&#237;n..." required/>
      </div>
    </div>
    <div class="divider"></div>
    <div class="stitle">Datos del Bacter&#237;&#243;logo</div>
    <div class="grid">
      <div class="f">
        <label>Nombres <span class="r">*</span></label>
        <input type="text" id="nom" placeholder="Tu(s) nombre(s)" required/>
      </div>
      <div class="f">
        <label>Apellidos <span class="r">*</span></label>
        <input type="text" id="ape" placeholder="Tu(s) apellido(s)" required/>
      </div>
      <div class="f">
        <label>N&#250;m. Documento <span class="r">*</span></label>
        <input type="text" id="doc" placeholder="CC / CE / Pasaporte" required/>
      </div>
      <div class="f">
        <label>Celular <span class="r">*</span></label>
        <input type="tel" id="cel" placeholder="3XXXXXXXXX" required/>
      </div>
      <div class="f full">
        <label>Correo Personal <span class="r">*</span></label>
        <input type="email" id="mail" placeholder="ejemplo@gmail.com" required/>
      </div>
      <div class="f full">
        <label>Confirmar Correo <span class="r">*</span></label>
        <input type="email" id="mail2" placeholder="Repite tu correo" required/>
      </div>
    </div>
    <div class="divider"></div>
    <div class="terms">
      <input type="checkbox" id="trm"/>
      <label for="trm">Acepto que mis datos sean usados exclusivamente para la Polla Mundialista CEISCOL 2026 y autorizo el tratamiento de informaci&#243;n seg&#250;n la pol&#237;tica de privacidad de CEISCOL.</label>
    </div>
    <div class="alert ok" id="ok">&#10003; &nbsp;<strong>&#161;Registro exitoso!</strong> Tu pron&#243;stico fue guardado. Revisa tu correo para confirmar. &#161;Vamos Colombia! &#127464;&#127476;</div>
    <div class="alert nok" id="nok"><span id="etxt">Error al enviar.</span></div>
    <button type="submit" class="btn" id="btn">
      <span id="btxt">&#9917;&nbsp; REGISTRAR MI PRON&#211;STICO</span>
      <div class="spin" id="spn"></div>
    </button>
  </form>
</div>

</div><!-- /wrap -->

<footer><strong>CEISCOL</strong> &bull; Polla Mundialista 2026 &bull; Solo para bacter&#237;&#243;logos registrados<br>Datos usados exclusivamente para este evento.</footer>

<script>
var s={c:0,p:0};
function ch(t,d){s[t]=Math.max(0,Math.min(15,s[t]+d));document.getElementById('s'+t).textContent=s[t];}
function ss(c,p){s.c=c;s.p=p;document.getElementById('sc').textContent=c;document.getElementById('sp').textContent=p;}

var SELF=window.location.href.split('?')[0];

document.getElementById('frm').addEventListener('submit',function(e){
  e.preventDefault();
  hide();
  var lab=v('lab'),ciu=v('ciu'),nom=v('nom'),ape=v('ape'),doc=v('doc'),cel=v('cel'),mail=v('mail'),mail2=v('mail2');
  var ok=true;
  ['lab','ciu','nom','ape','doc','cel','mail','mail2'].forEach(function(id){
    if(!v(id)){document.getElementById(id).classList.add('err');ok=false;}
  });
  if(!ok){err('Por favor completa todos los campos.');return;}
  if(!mail.includes('@')){err('El correo no es válido.');return;}
  if(mail!==mail2){err('Los correos no coinciden.');return;}
  if(!cel||cel.length<7){err('Ingresa un celular válido.');return;}
  if(!document.getElementById('trm').checked){err('Debes aceptar los términos.');return;}
  load(true);
  var d={
    fecha:new Date().toLocaleString('es-CO',{timeZone:'America/Bogota'}),
    laboratorio:lab,ciudad:ciu,nombres:nom,apellidos:ape,
    documento:doc,celular:cel,email:mail,
    col:s.c,por:s.p,marcador:s.c+' - '+s.p
  };
  fetch(SELF,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
    .then(function(r){return r.json();})
    .then(function(r){
      if(r.ok){document.getElementById('ok').style.display='block';document.getElementById('frm').reset();ss(0,0);window.scrollTo({top:0,behavior:'smooth'});}
      else{err('Error del servidor: '+r.msg);}
    })
    .catch(function(){err('Sin conexión. Verifica tu internet.');})  
    .finally(function(){load(false);});
});
document.querySelectorAll('input').forEach(function(el){el.addEventListener('input',function(){el.classList.remove('err');});});
function v(id){return document.getElementById(id).value.trim();}
function hide(){document.getElementById('ok').style.display='none';document.getElementById('nok').style.display='none';}
function err(m){document.getElementById('etxt').textContent=m;document.getElementById('nok').style.display='block';}
function load(on){document.getElementById('btn').disabled=on;document.getElementById('btxt').style.display=on?'none':'inline';document.getElementById('spn').style.display=on?'block':'none';}
</script>
</body>
</html>`;
}
