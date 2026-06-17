// ╔══════════════════════════════════════════════════════════════════╗
// ║  POLLA MUNDIALISTA CEISCOL 2026 — PRE-REGISTRO v3              ║
// ╚══════════════════════════════════════════════════════════════════╝

var REMITENTE_NOMBRE = 'CEISCOL Polla Mundialista 2026';
var EMAIL_CEISCOL    = 'ceiscol.asistente@gmail.com';

function doGet() {
  return HtmlService
    .createHtmlOutput(HTML_FORM)
    .setTitle('Pre-Registro — Polla Mundialista CEISCOL 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var d  = JSON.parse(e.postData.contents);
    var ss = obtenerOCrearSheet();
    var num = guardarRegistro(ss, d);
    enviarConfirmacion(d);
    registrarMensaje(ss, d, num);
    return resp({ ok: true });
  } catch(err) {
    Logger.log(err);
    return resp({ ok: false, msg: String(err) });
  }
}

function resp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerOCrearSheet() {
  var files = DriveApp.getFilesByName('Polla Mundialista CEISCOL 2026');
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create('Polla Mundialista CEISCOL 2026');
    var h0 = ss.getSheets()[0];
    h0.setName('Registros');
    darFormatoRegistros(h0);
    crearHojaMensajes(ss);
    crearHojaDashboard(ss);
    return ss;
  }
  if (!ss.getSheetByName('Registros'))  { var h = ss.insertSheet('Registros',0); darFormatoRegistros(h); }
  if (!ss.getSheetByName('Mensajes'))   crearHojaMensajes(ss);
  if (!ss.getSheetByName('Dashboard'))  crearHojaDashboard(ss);
  return ss;
}

function darFormatoRegistros(h) {
  h.clearFormats(); h.clearContents();
  h.setRowHeight(1, 44);
  h.getRange(1,1,1,16).merge()
    .setValue('⚽  POLLA MUNDIALISTA CEISCOL 2026  •  PRE-REGISTROS 🇨🇴 COLOMBIA')
    .setBackground('#CE1126').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(13)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  var H = ['#','Fecha','Hora','Cliente / Laboratorio','Ciudad','Dpto',
            'Nombres','Apellidos','Profesión','Tipo Doc','N° Doc',
            'Celular','Correo','Fecha Nacimiento','Edad','Estado Link'];
  h.setRowHeight(2, 34);
  h.getRange(2,1,1,H.length).setValues([H])
    .setBackground('#003087').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  var W = [45,85,65,230,120,120,140,140,160,110,110,110,210,120,55,120];
  W.forEach(function(w,i){ h.setColumnWidth(i+1,w); });
  h.setFrozenRows(2);
  h.getRange(3,16,1000,1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pendiente','Link Enviado','Confirmado','No responde']).build());
  h.setConditionalFormatRules([
    h.newConditionalFormatRule().whenTextEqualTo('Pendiente').setBackground('#FFF3CD').setFontColor('#856404').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Link Enviado').setBackground('#D1ECF1').setFontColor('#0C5460').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Confirmado').setBackground('#D4EDDA').setFontColor('#155724').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('No responde').setBackground('#F8D7DA').setFontColor('#721C24').setRanges([h.getRange(3,16,1000,1)]).build()
  ]);
}

function crearHojaMensajes(ss) {
  var h = ss.insertSheet('Mensajes');
  var H = ['#','Fecha','Hora','Destinatario','Correo','Tipo','Asunto','Estado','# Reg'];
  h.setRowHeight(1,44);
  h.getRange(1,1,1,H.length).merge()
    .setValue('📨  SEGUIMIENTO DE MENSAJES ENVIADOS — CEISCOL 2026')
    .setBackground('#003087').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(12)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  h.setRowHeight(2,32);
  h.getRange(2,1,1,H.length).setValues([H])
    .setBackground('#FFD700').setFontColor('#003087')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  [45,85,65,170,210,160,280,110,60].forEach(function(w,i){ h.setColumnWidth(i+1,w); });
  h.setFrozenRows(2);
  h.getRange(3,8,1000,1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['✅ Enviado','❌ Error','⏳ Pendiente']).build());
}

function crearHojaDashboard(ss) {
  var h = ss.insertSheet('Dashboard');
  h.setRowHeight(1,52);
  h.getRange(1,1,1,5).merge()
    .setValue('🏆  DASHBOARD — POLLA MUNDIALISTA CEISCOL 2026')
    .setBackground('#CE1126').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(15)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  var rows = [
    ['TOTAL REGISTROS',   '=COUNTA(Registros!G3:G)',                        '#003087'],
    ['LINKS ENVIADOS',    '=COUNTIF(Registros!P3:P,"Link Enviado")',         '#0077B6'],
    ['CONFIRMADOS',       '=COUNTIF(Registros!P3:P,"Confirmado")',           '#28A745'],
    ['PENDIENTES',        '=COUNTIF(Registros!P3:P,"Pendiente")',            '#E67E22'],
    ['MENSAJES ENVIADOS', '=COUNTA(Mensajes!E3:E)',                          '#6F42C1'],
    ['EDAD PROMEDIO',     '=IFERROR(ROUND(AVERAGE(Registros!O3:O),1),"—")', '#555555'],
    ['ACTUALIZACIÓN',     '=TEXT(NOW(),"DD/MM/YYYY HH:MM")',                 '#333333'],
  ];
  rows.forEach(function(r,i){
    var fila = i+3;
    h.setRowHeight(fila, 58);
    h.getRange(fila,2).setValue(r[0]).setBackground(r[2]).setFontColor('#fff')
      .setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center').setVerticalAlignment('middle');
    h.getRange(fila,3).setFormula(r[1]).setBackground('#F8F9FF').setFontColor(r[2])
      .setFontWeight('bold').setFontSize(24).setHorizontalAlignment('center').setVerticalAlignment('middle');
  });
  h.setColumnWidth(1,20); h.setColumnWidth(2,210); h.setColumnWidth(3,130);
}

function guardarRegistro(ss, d) {
  var h     = ss.getSheetByName('Registros');
  var lastR = Math.max(h.getLastRow(), 2);
  var num   = lastR - 1;
  var ahora = new Date();
  var newR  = lastR + 1;
  var fnac  = d.fecha_nac ? new Date(d.fecha_nac + 'T00:00:00') : '';
  h.appendRow([
    num,
    Utilities.formatDate(ahora,'America/Bogota','dd/MM/yyyy'),
    Utilities.formatDate(ahora,'America/Bogota','HH:mm:ss'),
    d.laboratorio, d.ciudad, d.dpto,
    d.nombres, d.apellidos, d.profesion,
    d.tipo_doc, d.num_doc, d.celular, d.email,
    fnac || '', '', 'Pendiente'
  ]);
  if (fnac) {
    h.getRange(newR,14).setNumberFormat('dd/mm/yyyy');
    h.getRange(newR,15).setFormula('=IF(N'+newR+'<>"",DATEDIF(N'+newR+',TODAY(),"Y"),"")');
    h.getRange(newR,15).setHorizontalAlignment('center').setFontWeight('bold').setFontColor('#003087');
  }
  var bg = (num % 2 === 0) ? '#EEF2FB' : '#FFFFFF';
  h.getRange(newR,1,1,16).setBackground(bg).setFontSize(10).setVerticalAlignment('middle');
  h.getRange(newR,1).setFontWeight('bold').setFontColor('#CE1126').setHorizontalAlignment('center');
  h.getRange(newR,4).setFontWeight('bold').setFontColor('#003087');
  h.setRowHeight(newR, 26);
  return num;
}

function registrarMensaje(ss, d, num) {
  var h    = ss.getSheetByName('Mensajes');
  var msgN = Math.max(h.getLastRow()-1, 0)+1;
  var now  = new Date();
  h.appendRow([
    msgN,
    Utilities.formatDate(now,'America/Bogota','dd/MM/yyyy'),
    Utilities.formatDate(now,'America/Bogota','HH:mm:ss'),
    d.nombres+' '+d.apellidos, d.email,
    'Confirmación Pre-registro',
    'Pre-registro Polla CEISCOL 2026 — Confirmación',
    '✅ Enviado', num
  ]);
  var fil = h.getLastRow();
  h.getRange(fil,1,1,9).setBackground(msgN%2===0?'#F0F4FF':'#FFFFFF').setFontSize(10).setVerticalAlignment('middle');
  h.setRowHeight(fil,24);
}

function enviarConfirmacion(d) {
  var nombre = d.nombres+' '+d.apellidos;
  var fnacFmt = '';
  if (d.fecha_nac) { var p=d.fecha_nac.split('-'); fnacFmt=p[2]+'/'+p[1]+'/'+p[0]; }

  var html =
   '<!DOCTYPE html><html><head><meta charset="UTF-8">'
  +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#f0f2f5;}'
  +'.w{max-width:580px;margin:20px auto;border-radius:14px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,.15);}'
  +'</style></head><body>'
  +'<div class="w">'
  +'<div style="display:flex;height:7px;"><div style="flex:1;background:#FFD700"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#CE1126"></div></div>'
  +'<div style="background:linear-gradient(135deg,#001233 0%,#003087 50%,#8b0000 100%);padding:36px 28px;text-align:center;">'
  +'<div style="font-size:56px;">⚽</div>'
  +'<h1 style="color:#FFD700;font-size:23px;font-weight:700;margin-top:10px;">¡Ya estás inscrito!</h1>'
  +'<p style="color:rgba(255,255,255,.8);font-size:13px;margin-top:5px;">Polla Mundialista CEISCOL 2026</p>'
  +'</div>'
  +'<div style="background:#fff;padding:30px 28px;">'
  +'<p style="font-size:15px;color:#1a1a2e;">Hola <b style="color:#003087;">'+nombre+'</b>,</p>'
  +'<p style="font-size:14px;color:#555;line-height:1.7;margin-top:10px;">Tu inscripción en la <b>Polla Mundialista CEISCOL 2026</b> fue registrada con éxito. 🎉</p>'
  +'<div style="background:linear-gradient(135deg,#fffbea,#fff3cd);border:2px solid #FFD700;border-radius:12px;padding:22px;margin:22px 0;text-align:center;">'
  +'<div style="font-size:36px;">📲</div>'
  +'<p style="font-size:16px;font-weight:700;color:#003087;margin-top:10px;">Próximamente recibirás el link</p>'
  +'<p style="font-size:13px;color:#666;line-height:1.6;margin-top:8px;">Te enviaremos el <b>link exclusivo</b> para ingresar tu marcador. <b>¡Mantente atento!</b></p>'
  +'</div>'
  +'<table style="width:100%;border-collapse:collapse;font-size:13px;">'
  +'<tr><th colspan="2" style="background:#003087;color:#FFD700;padding:10px 14px;text-align:left;">📋 TUS DATOS</th></tr>'
  +'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;width:40%;">🏥 Laboratorio</td><td style="padding:9px 14px;font-weight:700;color:#003087;">'+d.laboratorio+'</td></tr>'
  +'<tr><td style="padding:9px 14px;color:#888;">📍 Ciudad</td><td style="padding:9px 14px;">'+d.ciudad+' — '+d.dpto+'</td></tr>'
  +'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;">👤 Nombre</td><td style="padding:9px 14px;font-weight:600;">'+nombre+'</td></tr>'
  +'<tr><td style="padding:9px 14px;color:#888;">🔬 Profesión</td><td style="padding:9px 14px;">'+d.profesion+'</td></tr>'
  +(fnacFmt?'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;">🎂 Fecha Nac.</td><td style="padding:9px 14px;">'+fnacFmt+'</td></tr>':'')
  +'</table>'
  +'<p style="font-size:12px;color:#bbb;margin-top:24px;text-align:center;">¡Vamos Colombia! 💛💙❤️ • CEISCOL 2026</p>'
  +'</div>'
  +'<div style="display:flex;height:7px;"><div style="flex:1;background:#CE1126"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#FFD700"></div></div>'
  +'</div></body></html>';

  MailApp.sendEmail({ to: d.email, subject: '⚽ ¡Inscripción exitosa! Polla Mundialista CEISCOL 2026', htmlBody: html, name: REMITENTE_NOMBRE });

  MailApp.sendEmail({
    to: EMAIL_CEISCOL,
    subject: '🔔 Nuevo pre-registro: '+nombre+' | '+d.laboratorio,
    htmlBody:
     '<div style="font-family:Arial;max-width:540px;padding:20px;">'
    +'<h2 style="color:#003087;">⚽ Nuevo pre-registro</h2>'
    +'<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:14px;">'
    +'<tr><th colspan="2" style="background:#003087;color:#FFD700;padding:9px 12px;text-align:left;">DATOS</th></tr>'
    +'<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#666;width:38%;">Laboratorio</td><td style="padding:8px 12px;"><b>'+d.laboratorio+'</b></td></tr>'
    +'<tr><td style="padding:8px 12px;color:#666;">Ciudad</td><td style="padding:8px 12px;">'+d.ciudad+' — '+d.dpto+'</td></tr>'
    +'<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#666;">Nombre</td><td style="padding:8px 12px;"><b>'+nombre+'</b></td></tr>'
    +'<tr><td style="padding:8px 12px;color:#666;">Profesión</td><td style="padding:8px 12px;">'+d.profesion+'</td></tr>'
    +'<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#666;">Documento</td><td style="padding:8px 12px;">'+d.tipo_doc+' '+d.num_doc+'</td></tr>'
    +'<tr><td style="padding:8px 12px;color:#666;">Celular</td><td style="padding:8px 12px;">'+d.celular+'</td></tr>'
    +'<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#666;">Correo</td><td style="padding:8px 12px;"><b>'+d.email+'</b></td></tr>'
    +(fnacFmt?'<tr><td style="padding:8px 12px;color:#666;">Fecha Nac.</td><td style="padding:8px 12px;">'+fnacFmt+'</td></tr>':'')
    +'</table></div>',
    name: 'Sistema CEISCOL 2026'
  });
}

// ═══════════════════════════════════════════════════════════════════
var HTML_FORM = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Pre-Registro · Polla Mundialista CEISCOL 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
:root{
  --gold:#FFD700;
  --blue:#003087;
  --red:#CE1126;
  --dark:#0d1117;
  --card:rgba(20,27,46,.95);
  --border:rgba(255,215,0,.14);
  --input-bg:rgba(255,255,255,.05);
  --input-border:rgba(255,255,255,.12);
  --text:#e8eaf0;
  --muted:rgba(255,255,255,.35);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-tap-highlight-color:transparent;}
body{font-family:Inter,sans-serif;background:var(--dark);color:var(--text);min-height:100vh;
  background-image:radial-gradient(ellipse at 0% 0%,rgba(0,48,135,.25) 0%,transparent 55%),radial-gradient(ellipse at 100% 100%,rgba(206,17,38,.18) 0%,transparent 55%);}
.tc{position:fixed;top:0;left:0;right:0;height:4px;display:flex;z-index:999;}
.tc span{flex:1;}
.tc .y{background:var(--gold);} .tc .b{background:var(--blue);} .tc .r{background:var(--red);}
.hero{padding:52px 20px 64px;text-align:center;background:linear-gradient(160deg,#001233 0%,#002570 38%,#4a0010 72%,#CE1126 100%);position:relative;overflow:hidden;}
.hero-flags{font-size:40px;margin-bottom:10px;}
.chip{display:inline-block;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.28);border-radius:100px;padding:4px 16px;font-size:10px;font-weight:600;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;}
.hero h1{font-family:Oswald,sans-serif;font-weight:700;font-size:clamp(28px,8vw,52px);line-height:1.1;color:#fff;}
.hero h1 .g{color:var(--gold);} .hero h1 .r2{color:#FF5A5A;}
.hero-sub{margin-top:8px;font-size:11px;color:rgba(255,255,255,.45);letter-spacing:1.5px;text-transform:uppercase;}
.page{max-width:560px;margin:0 auto;padding:0 14px;}
.banner{margin:-28px auto 0;background:linear-gradient(135deg,rgba(255,215,0,.09),rgba(0,48,135,.18));border:1.5px solid rgba(255,215,0,.22);border-radius:12px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;position:relative;z-index:10;}
.banner-ico{font-size:26px;flex-shrink:0;}
.banner-txt p{font-size:12px;color:rgba(255,255,255,.58);line-height:1.65;}
.banner-txt b{color:var(--gold);}
.form-wrap{padding:18px 0 48px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 18px;box-shadow:0 24px 60px rgba(0,0,0,.5);}
@media(min-width:420px){.card{padding:26px 24px;}}
.sec{display:flex;align-items:center;gap:8px;font-family:Oswald,sans-serif;font-size:10.5px;font-weight:500;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:14px;}
.sec::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(255,215,0,.35),transparent);}
.div{height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,.18),transparent);margin:20px 0;}
.g1{display:flex;flex-direction:column;gap:12px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:420px){.g2{grid-template-columns:1fr;}}
.f{display:flex;flex-direction:column;gap:5px;}
.lbl{font-size:10px;font-weight:600;color:var(--muted);letter-spacing:1px;text-transform:uppercase;}
.lbl .r{color:var(--gold);margin-left:2px;}
input,select{width:100%;background:var(--input-bg);border:1.5px solid var(--input-border);border-radius:10px;color:var(--text);font-family:Inter,sans-serif;font-size:15px;padding:13px 14px;transition:border-color .18s,background .18s;-webkit-appearance:none;appearance:none;}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23FFD700'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;cursor:pointer;}
select option{background:#1a2236;color:var(--text);}
input::placeholder{color:rgba(255,255,255,.2);font-size:14px;}
input:focus,select:focus{outline:none;border-color:rgba(255,215,0,.55);box-shadow:0 0 0 3px rgba(255,215,0,.08);background:rgba(255,255,255,.07);}
input.err,select.err{border-color:var(--red)!important;box-shadow:0 0 0 3px rgba(206,17,38,.12)!important;}
.lab-wrap{position:relative;}
.lab-wrap input{padding-left:44px;}
.lab-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:18px;pointer-events:none;}
/* PROFESION — input y label deben ser hermanos directos en el DOM */
.prof-pills{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;}
@media(min-width:400px){.prof-pills{grid-template-columns:repeat(4,1fr);}}
.prof-opt{display:none;}
.prof-pill{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 6px;background:var(--input-bg);border:1.5px solid var(--input-border);border-radius:10px;cursor:pointer;transition:all .16s;text-align:center;user-select:none;}
.prof-pill .pi{font-size:22px;line-height:1;}
.prof-pill .pt{font-size:10.5px;font-weight:600;color:var(--muted);line-height:1.3;}
.prof-opt:checked + .prof-pill{background:rgba(255,215,0,.11);border-color:var(--gold);box-shadow:0 0 0 2px rgba(255,215,0,.08);}
.prof-opt:checked + .prof-pill .pt{color:var(--gold);}
.prof-wrap.err .prof-pill{border-color:rgba(206,17,38,.35);}
.prof-err{font-size:11px;color:#ff7070;margin-top:5px;display:none;}
.prof-wrap.err .prof-err{display:block;}
.dob{display:grid;grid-template-columns:1fr 1.7fr 1fr;gap:9px;}
.dob-item{display:flex;flex-direction:column;gap:4px;}
.dob-sub{font-size:9px;color:rgba(255,255,255,.22);text-align:center;letter-spacing:.5px;text-transform:uppercase;}
.terms{display:flex;align-items:flex-start;gap:11px;padding:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;}
.terms input[type=checkbox]{width:18px;height:18px;min-width:18px;accent-color:var(--gold);cursor:pointer;margin-top:1px;}
.terms p{font-size:11.5px;color:rgba(255,255,255,.35);line-height:1.6;}
.alert{border-radius:10px;padding:14px 16px;font-size:13.5px;line-height:1.55;margin-top:14px;display:none;}
.ok-a{background:rgba(40,167,69,.1);border:1px solid rgba(40,167,69,.3);color:#6fcf97;}
.er-a{background:rgba(206,17,38,.1);border:1px solid rgba(206,17,38,.3);color:#ff8080;}
.btn{width:100%;margin-top:18px;padding:17px 20px;border:none;border-radius:12px;font-family:Oswald,sans-serif;font-size:17px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer;background:linear-gradient(90deg,#FFD700,#FF8800,#CE1126);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.3);box-shadow:0 4px 20px rgba(206,17,38,.3);transition:transform .18s;}
.btn:hover{transform:translateY(-2px);}
.btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
.spin{display:none;width:22px;height:22px;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite;margin:0 auto;}
@keyframes sp{to{transform:rotate(360deg)}}
footer{text-align:center;padding:20px 16px 30px;font-size:10px;color:rgba(255,255,255,.16);letter-spacing:1px;}
footer b{color:rgba(255,215,0,.35);}
</style>
</head>
<body>
<div class="tc"><span class="y"></span><span class="b"></span><span class="r"></span></div>
<div class="hero">
  <div class="hero-flags">🇨🇴 ⚽ 🇵🇹</div>
  <div class="chip">🏆 Copa Mundo 2026 · CEISCOL</div>
  <h1>PRE-REGISTRO<br><span class="g">POLLA MUNDIALISTA</span><br><span class="r2">CEISCOL 2026</span></h1>
  <p class="hero-sub">Colombia 🇨🇴 vs Portugal 🇵🇹 · Solo para bacteriólogos</p>
</div>
<div class="page">
<div class="banner">
  <div class="banner-ico">📲</div>
  <div class="banner-txt"><p>Regístrate aquí. <b>Próximamente recibirás el link exclusivo</b> para ingresar tu marcador. Este formulario reserva tu cupo. <b>¡Mantente atento!</b></p></div>
</div>
<div class="form-wrap"><div class="card">
<form id="frm" novalidate>

<div class="sec">🏥 Laboratorio / Cliente</div>
<div class="g1">
  <div class="f">
    <label class="lbl">Nombre del Laboratorio o Cliente <span class="r">*</span></label>
    <div class="lab-wrap"><span class="lab-ico">🏥</span><input type="text" id="lab" placeholder="Laboratorio Clínico San Rafael" required/></div>
  </div>
  <div class="g2">
    <div class="f"><label class="lbl">Ciudad / Municipio <span class="r">*</span></label><input type="text" id="ciu" placeholder="Bogotá, Cali..." required/></div>
    <div class="f"><label class="lbl">Departamento <span class="r">*</span></label><input type="text" id="dpto" placeholder="Cundinamarca..." required/></div>
  </div>
</div>

<div class="div"></div>

<div class="sec">🔬 Profesión <span class="r">*</span></div>
<div class="prof-wrap" id="pw">
  <div class="prof-pills">
    <input class="prof-opt" type="radio" name="prof" id="p1" value="Bacteriólogo/a"/>
    <label class="prof-pill" for="p1"><span class="pi">🔬</span><span class="pt">Bacteriólogo/a</span></label>
    <input class="prof-opt" type="radio" name="prof" id="p2" value="Auxiliar de Laboratorio"/>
    <label class="prof-pill" for="p2"><span class="pi">🧪</span><span class="pt">Auxiliar de Lab.</span></label>
    <input class="prof-opt" type="radio" name="prof" id="p3" value="Administrativo/a"/>
    <label class="prof-pill" for="p3"><span class="pi">💼</span><span class="pt">Administrativo/a</span></label>
    <input class="prof-opt" type="radio" name="prof" id="p4" value="Otro"/>
    <label class="prof-pill" for="p4"><span class="pi">👤</span><span class="pt">Otro</span></label>
  </div>
  <div class="prof-err">⚠ Selecciona tu profesión</div>
</div>

<div class="div"></div>

<div class="sec">👤 Datos Personales</div>
<div class="g1">
  <div class="g2">
    <div class="f"><label class="lbl">Nombres <span class="r">*</span></label><input type="text" id="nom" placeholder="Tu(s) nombre(s)" autocomplete="given-name" required/></div>
    <div class="f"><label class="lbl">Apellidos <span class="r">*</span></label><input type="text" id="ape" placeholder="Tu(s) apellido(s)" autocomplete="family-name" required/></div>
    <div class="f"><label class="lbl">Tipo de Documento <span class="r">*</span></label>
      <select id="tdoc"><option value="">Selecciona...</option><option>Cédula de Ciudadanía</option><option>Cédula de Extranjería</option><option>Pasaporte</option><option>Tarjeta de Identidad</option></select>
    </div>
    <div class="f"><label class="lbl">N° Documento <span class="r">*</span></label><input type="text" id="ndoc" placeholder="Número" inputmode="numeric" required/></div>
    <div class="f"><label class="lbl">Celular <span class="r">*</span></label><input type="tel" id="cel" placeholder="3XX XXX XXXX" inputmode="tel" autocomplete="tel" required/></div>
    <div class="f">
      <label class="lbl">🎂 Fecha de Nacimiento <span class="r">*</span></label>
      <div class="dob">
        <div class="dob-item"><select id="dd"><option value="">Día</option></select><span class="dob-sub">Día</span></div>
        <div class="dob-item">
          <select id="dm"><option value="">Mes</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select>
          <span class="dob-sub">Mes</span>
        </div>
        <div class="dob-item"><select id="dy"><option value="">Año</option></select><span class="dob-sub">Año</span></div>
      </div>
    </div>
  </div>
  <div class="f"><label class="lbl">Correo Personal <span class="r">*</span></label><input type="email" id="mail" placeholder="ejemplo@gmail.com" autocomplete="email" inputmode="email" required/></div>
  <div class="f"><label class="lbl">Confirmar Correo <span class="r">*</span></label><input type="email" id="mail2" placeholder="Repite tu correo" required/></div>
</div>

<div class="div"></div>

<div class="terms">
  <input type="checkbox" id="trm"/>
  <p>Autorizo el uso de mis datos personales exclusivamente para la Polla Mundialista CEISCOL 2026, conforme a la Ley 1581 de 2012.</p>
</div>
<div class="alert ok-a" id="ok">✅ &nbsp;<strong>¡Pre-registro exitoso!</strong> Revisa tu correo. Pronto recibirás el link. ¡Vamos Colombia! 🇨🇴</div>
<div class="alert er-a" id="er"><span id="etxt">Error.</span></div>
<button type="submit" class="btn" id="btn"><span id="btxt">⚽ REGISTRARME PARA LA POLLA</span><div class="spin" id="spn"></div></button>

</form></div></div>
</div>
<footer><b>CEISCOL</b> · Polla Mundialista 2026 · Colombia 🇨🇴 vs Portugal 🇵🇹</footer>
<script>
(function(){
  var dd=document.getElementById('dd');
  for(var i=1;i<=31;i++){var o=document.createElement('option');o.value=o.text=(i<10?'0':'')+i;dd.add(o);}
  var dy=document.getElementById('dy'),ay=new Date().getFullYear();
  for(var j=ay-16;j>=ay-85;j--){var o2=document.createElement('option');o2.value=o2.text=j;dy.add(o2);}
})();
var SELF=window.location.href.split('?')[0];
document.getElementById('frm').addEventListener('submit',function(e){
  e.preventDefault(); hide();
  var lab=v('lab'),ciu=v('ciu'),dpto=v('dpto');
  var nom=v('nom'),ape=v('ape'),tdoc=v('tdoc'),ndoc=v('ndoc'),cel=v('cel');
  var mail=v('mail'),mail2=v('mail2');
  var dd=v('dd'),dm=v('dm'),dy=v('dy');
  var prof='';
  document.querySelectorAll('input[name=prof]').forEach(function(r){if(r.checked)prof=r.value;});
  var ok=true;
  ['lab','ciu','dpto','nom','ape','tdoc','ndoc','cel','mail','mail2'].forEach(function(id){
    if(!v(id)){document.getElementById(id).classList.add('err');ok=false;}
  });
  if(!prof){document.getElementById('pw').classList.add('err');ok=false;}
  if(!dd||!dm||!dy){['dd','dm','dy'].forEach(function(id){if(!v(id))document.getElementById(id).classList.add('err');});ok=false;}
  if(!ok){return err('Por favor completa todos los campos.');}
  if(!mail.includes('@')){return err('El correo no es válido.');}
  if(mail!==mail2){return err('Los correos no coinciden.');}
  if(cel.replace(/\D/g,'').length<7){return err('El celular no es válido.');}
  if(!document.getElementById('trm').checked){return err('Debes aceptar la autorización de datos.');}
  load(true);
  fetch(SELF,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({laboratorio:lab,ciudad:ciu,dpto:dpto,nombres:nom,apellidos:ape,profesion:prof,tipo_doc:tdoc,num_doc:ndoc,celular:cel,email:mail,fecha_nac:dy+'-'+dm+'-'+dd})})
  .then(function(r){return r.json();})
  .then(function(r){
    if(r.ok){document.getElementById('ok').style.display='block';document.getElementById('frm').reset();window.scrollTo({top:0,behavior:'smooth'});}
    else{err('Error del servidor. Intenta de nuevo.');}
  })
  .catch(function(){err('Sin conexión. Verifica tu internet.');})
  .finally(function(){load(false);});
});
document.querySelectorAll('input,select').forEach(function(el){
  ['input','change'].forEach(function(ev){el.addEventListener(ev,function(){el.classList.remove('err');});});
});
document.querySelectorAll('input[name=prof]').forEach(function(r){
  r.addEventListener('change',function(){document.getElementById('pw').classList.remove('err');});
});
function v(id){return document.getElementById(id).value.trim();}
function hide(){document.getElementById('ok').style.display='none';document.getElementById('er').style.display='none';}
function err(m){document.getElementById('etxt').textContent=m;document.getElementById('er').style.display='block';document.getElementById('er').scrollIntoView({behavior:'smooth',block:'center'});}
function load(on){document.getElementById('btn').disabled=on;document.getElementById('btxt').style.display=on?'none':'inline';document.getElementById('spn').style.display=on?'block':'none';}
</script>
</body>
</html>`;
