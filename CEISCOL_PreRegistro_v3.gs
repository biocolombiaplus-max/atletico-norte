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
  h.setRowHeight(1,44);
  h.getRange(1,1,1,16).merge().setValue('⚽  POLLA MUNDIALISTA CEISCOL 2026  •  PRE-REGISTROS 🇨🇴')
    .setBackground('#CE1126').setFontColor('#FFD700').setFontWeight('bold').setFontSize(13)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  var H=['#','Fecha','Hora','Cliente / Laboratorio','Ciudad','Dpto','Nombres','Apellidos','Profesión','Tipo Doc','N° Doc','Celular','Correo','Fecha Nacimiento','Edad','Estado Link'];
  h.setRowHeight(2,34);
  h.getRange(2,1,1,H.length).setValues([H]).setBackground('#003087').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(10).setHorizontalAlignment('center').setVerticalAlignment('middle');
  [45,85,65,230,120,120,140,140,160,110,110,110,210,120,55,120].forEach(function(w,i){h.setColumnWidth(i+1,w);});
  h.setFrozenRows(2);
  h.getRange(3,16,1000,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pendiente','Link Enviado','Confirmado','No responde']).build());
  h.setConditionalFormatRules([
    h.newConditionalFormatRule().whenTextEqualTo('Pendiente').setBackground('#FFF3CD').setFontColor('#856404').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Link Enviado').setBackground('#D1ECF1').setFontColor('#0C5460').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Confirmado').setBackground('#D4EDDA').setFontColor('#155724').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('No responde').setBackground('#F8D7DA').setFontColor('#721C24').setRanges([h.getRange(3,16,1000,1)]).build()
  ]);
}

function crearHojaMensajes(ss) {
  var h=ss.insertSheet('Mensajes');
  var H=['#','Fecha','Hora','Destinatario','Correo','Tipo','Asunto','Estado','# Reg'];
  h.setRowHeight(1,44);
  h.getRange(1,1,1,H.length).merge().setValue('📨  SEGUIMIENTO DE MENSAJES — CEISCOL 2026')
    .setBackground('#003087').setFontColor('#FFD700').setFontWeight('bold').setFontSize(12)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  h.setRowHeight(2,32);
  h.getRange(2,1,1,H.length).setValues([H]).setBackground('#FFD700').setFontColor('#003087')
    .setFontWeight('bold').setFontSize(10).setHorizontalAlignment('center').setVerticalAlignment('middle');
  [45,85,65,170,210,160,280,110,60].forEach(function(w,i){h.setColumnWidth(i+1,w);});
  h.setFrozenRows(2);
  h.getRange(3,8,1000,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['✅ Enviado','❌ Error','⏳ Pendiente']).build());
}

function crearHojaDashboard(ss) {
  var h=ss.insertSheet('Dashboard');
  h.setRowHeight(1,52);
  h.getRange(1,1,1,5).merge().setValue('🏆  DASHBOARD — POLLA MUNDIALISTA CEISCOL 2026')
    .setBackground('#CE1126').setFontColor('#FFD700').setFontWeight('bold').setFontSize(15)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  var rows=[
    ['TOTAL REGISTROS','=COUNTA(Registros!G3:G)','#003087'],
    ['LINKS ENVIADOS','=COUNTIF(Registros!P3:P,"Link Enviado")','#0077B6'],
    ['CONFIRMADOS','=COUNTIF(Registros!P3:P,"Confirmado")','#28A745'],
    ['PENDIENTES','=COUNTIF(Registros!P3:P,"Pendiente")','#E67E22'],
    ['MENSAJES ENVIADOS','=COUNTA(Mensajes!E3:E)','#6F42C1'],
    ['EDAD PROMEDIO','=IFERROR(ROUND(AVERAGE(Registros!O3:O),1),"—")','#555555'],
    ['ACTUALIZACIÓN','=TEXT(NOW(),"DD/MM/YYYY HH:MM")','#333333']
  ];
  rows.forEach(function(r,i){
    var f=i+3; h.setRowHeight(f,58);
    h.getRange(f,2).setValue(r[0]).setBackground(r[2]).setFontColor('#fff').setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center').setVerticalAlignment('middle');
    h.getRange(f,3).setFormula(r[1]).setBackground('#F8F9FF').setFontColor(r[2]).setFontWeight('bold').setFontSize(24).setHorizontalAlignment('center').setVerticalAlignment('middle');
  });
  h.setColumnWidth(1,20); h.setColumnWidth(2,210); h.setColumnWidth(3,130);
}

function guardarRegistro(ss, d) {
  var h=ss.getSheetByName('Registros');
  var lastR=Math.max(h.getLastRow(),2), num=lastR-1, ahora=new Date(), newR=lastR+1;
  var fnac=d.fecha_nac?new Date(d.fecha_nac+'T00:00:00'):'';
  h.appendRow([num,Utilities.formatDate(ahora,'America/Bogota','dd/MM/yyyy'),Utilities.formatDate(ahora,'America/Bogota','HH:mm:ss'),
    d.laboratorio,d.ciudad,d.dpto,d.nombres,d.apellidos,d.profesion,d.tipo_doc,d.num_doc,d.celular,d.email,fnac||'','','Pendiente']);
  if(fnac){
    h.getRange(newR,14).setNumberFormat('dd/mm/yyyy');
    h.getRange(newR,15).setFormula('=IF(N'+newR+'<>"",DATEDIF(N'+newR+',TODAY(),"Y"),"")');
    h.getRange(newR,15).setHorizontalAlignment('center').setFontWeight('bold').setFontColor('#003087');
  }
  var bg=(num%2===0)?'#EEF2FB':'#FFFFFF';
  h.getRange(newR,1,1,16).setBackground(bg).setFontSize(10).setVerticalAlignment('middle');
  h.getRange(newR,1).setFontWeight('bold').setFontColor('#CE1126').setHorizontalAlignment('center');
  h.getRange(newR,4).setFontWeight('bold').setFontColor('#003087');
  h.setRowHeight(newR,26);
  return num;
}

function registrarMensaje(ss,d,num) {
  var h=ss.getSheetByName('Mensajes'), msgN=Math.max(h.getLastRow()-1,0)+1, now=new Date();
  h.appendRow([msgN,Utilities.formatDate(now,'America/Bogota','dd/MM/yyyy'),Utilities.formatDate(now,'America/Bogota','HH:mm:ss'),
    d.nombres+' '+d.apellidos,d.email,'Confirmación Pre-registro','Pre-registro Polla CEISCOL 2026','✅ Enviado',num]);
  var fil=h.getLastRow();
  h.getRange(fil,1,1,9).setBackground(msgN%2===0?'#F0F4FF':'#FFFFFF').setFontSize(10).setVerticalAlignment('middle');
  h.setRowHeight(fil,24);
}

function enviarConfirmacion(d) {
  var nombre=d.nombres+' '+d.apellidos, fnacFmt='';
  if(d.fecha_nac){var p=d.fecha_nac.split('-');fnacFmt=p[2]+'/'+p[1]+'/'+p[0];}
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8">'
  +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#f0f2f5;}'
  +'.w{max-width:580px;margin:20px auto;border-radius:14px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,.15);}'
  +'</style></head><body><div class="w">'
  +'<div style="display:flex;height:7px;"><div style="flex:1;background:#FFD700"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#CE1126"></div></div>'
  +'<div style="background:linear-gradient(135deg,#001233,#003087 50%,#8b0000);padding:36px 28px;text-align:center;">'
  +'<div style="font-size:56px;">⚽</div>'
  +'<h1 style="color:#FFD700;font-size:23px;font-weight:700;margin-top:10px;">¡Ya estás inscrito!</h1>'
  +'<p style="color:rgba(255,255,255,.8);font-size:13px;margin-top:5px;">Polla Mundialista CEISCOL 2026</p></div>'
  +'<div style="background:#fff;padding:30px 28px;">'
  +'<p style="font-size:15px;color:#1a1a2e;">Hola <b style="color:#003087;">'+nombre+'</b>,</p>'
  +'<p style="font-size:14px;color:#555;line-height:1.7;margin-top:10px;">Tu inscripción fue registrada con éxito. 🎉</p>'
  +'<div style="background:#fffbea;border:2px solid #FFD700;border-radius:12px;padding:22px;margin:22px 0;text-align:center;">'
  +'<p style="font-size:16px;font-weight:700;color:#003087;">📲 Próximamente recibirás el link</p>'
  +'<p style="font-size:13px;color:#666;line-height:1.6;margin-top:8px;">Te enviaremos el link para registrar tu marcador. <b>¡Mantente atento!</b></p></div>'
  +'<table style="width:100%;border-collapse:collapse;font-size:13px;">'
  +'<tr><th colspan="2" style="background:#003087;color:#FFD700;padding:10px 14px;text-align:left;">📋 TUS DATOS</th></tr>'
  +'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;width:40%;">🏥 Laboratorio</td><td style="padding:9px 14px;font-weight:700;color:#003087;">'+d.laboratorio+'</td></tr>'
  +'<tr><td style="padding:9px 14px;color:#888;">📍 Ciudad</td><td style="padding:9px 14px;">'+d.ciudad+' — '+d.dpto+'</td></tr>'
  +'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;">👤 Nombre</td><td style="padding:9px 14px;font-weight:600;">'+nombre+'</td></tr>'
  +'<tr><td style="padding:9px 14px;color:#888;">🔬 Profesión</td><td style="padding:9px 14px;">'+d.profesion+'</td></tr>'
  +(fnacFmt?'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;">🎂 Fecha Nac.</td><td style="padding:9px 14px;">'+fnacFmt+'</td></tr>':'')
  +'</table>'
  +'<p style="font-size:12px;color:#bbb;margin-top:24px;text-align:center;">¡Vamos Colombia! 💛💙❤️ • CEISCOL 2026</p></div>'
  +'<div style="display:flex;height:7px;"><div style="flex:1;background:#CE1126"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#FFD700"></div></div>'
  +'</div></body></html>';
  MailApp.sendEmail({to:d.email,subject:'⚽ ¡Inscripción exitosa! Polla Mundialista CEISCOL 2026',htmlBody:html,name:REMITENTE_NOMBRE});
  MailApp.sendEmail({to:EMAIL_CEISCOL,subject:'🔔 Nuevo pre-registro: '+nombre+' | '+d.laboratorio,
    htmlBody:'<div style="font-family:Arial;max-width:540px;padding:20px;"><h2 style="color:#003087;">⚽ Nuevo pre-registro</h2>'
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
    +'</table></div>',name:'Sistema CEISCOL 2026'});
}

// =================================================================
var HTML_FORM = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Pre-Registro · Polla Mundialista CEISCOL 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

html{
  font-size:16px;
  -webkit-text-size-adjust:100%;
  overflow-x:hidden;
}

body{
  font-family:'Inter',sans-serif;
  background:#f4f6fb;
  color:#1a2036;
  width:100%;
  min-height:100vh;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}

/* ── BARRA TRICOLOR sticky ── */
.tc{
  width:100%;
  height:6px;
  display:flex;
  position:sticky;
  top:0;
  z-index:10;
}
.tc span{flex:1;}
.tc .y{background:#FFD700;}
.tc .b{background:#003087;}
.tc .r{background:#CE1126;}

/* ── HERO ── */
.hero{
  width:100%;
  padding:36px 20px 64px;
  text-align:center;
  background:linear-gradient(160deg,#002266 0%,#003087 50%,#8b0000 80%,#CE1126 100%);
}
.hero-flags{font-size:38px;margin-bottom:10px;}
.badge{
  display:inline-block;
  background:rgba(255,215,0,.18);
  border:1.5px solid rgba(255,215,0,.5);
  border-radius:100px;
  padding:5px 18px;
  font-size:10px;
  font-weight:700;
  color:#FFD700;
  letter-spacing:2px;
  text-transform:uppercase;
  margin-bottom:14px;
}
.hero h1{
  font-family:'Oswald',sans-serif;
  font-size:clamp(28px,9vw,52px);
  font-weight:700;
  line-height:1.08;
  color:#fff;
}
.hero h1 .gold{color:#FFD700;}
.hero h1 .red{color:#ffaaaa;}
.hero-vs{
  margin-top:16px;
  display:inline-flex;
  align-items:center;
  gap:10px;
  background:rgba(255,255,255,.12);
  border:1px solid rgba(255,255,255,.2);
  border-radius:100px;
  padding:9px 22px;
  font-size:15px;
  font-weight:600;
  color:#fff;
}

/* ── CONTENEDOR PRINCIPAL ── */
.main{
  width:100%;
  padding:0 12px 56px;
}
@media(min-width:600px){
  .main{max-width:620px;margin:0 auto;padding:0 20px 56px;}
}

/* ── AVISO ── */
.aviso{
  background:#fff;
  border-left:5px solid #FFD700;
  border-radius:12px;
  padding:14px 16px;
  display:flex;
  gap:12px;
  align-items:center;
  margin-top:-28px;
  position:relative;
  z-index:2;
  box-shadow:0 4px 18px rgba(0,48,135,.1);
}
.aviso-i{font-size:26px;flex-shrink:0;}
.aviso p{font-size:13px;color:#444;line-height:1.6;}
.aviso b{color:#003087;}

/* ── TARJETA FORMULARIO ── */
.card{
  background:#fff;
  border:1.5px solid #e8ecf4;
  border-radius:18px;
  padding:22px 14px;
  margin-top:14px;
  box-shadow:0 8px 32px rgba(0,48,135,.08);
  width:100%;
}
@media(min-width:480px){.card{padding:26px 22px;}}

/* ── SECCIÓN ── */
.sec{
  display:flex;
  align-items:center;
  gap:8px;
  font-family:'Oswald',sans-serif;
  font-size:11px;
  font-weight:600;
  letter-spacing:3px;
  color:#003087;
  text-transform:uppercase;
  margin-bottom:16px;
}
.sec::after{
  content:'';
  flex:1;
  height:2px;
  background:linear-gradient(90deg,#003087,#FFD700,transparent);
  border-radius:2px;
}
.line{
  height:1px;
  background:linear-gradient(90deg,transparent,#e0e6f0,transparent);
  margin:22px 0;
}

/* ── LAYOUT CAMPOS ── */
.stack{display:flex;flex-direction:column;gap:14px;}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:360px){.duo{grid-template-columns:1fr;}}

/* ── LABEL + INPUT ── */
.fld{display:flex;flex-direction:column;gap:6px;}
.lbl{
  font-size:10.5px;
  font-weight:700;
  color:#6b7a9b;
  letter-spacing:1px;
  text-transform:uppercase;
}
.req{color:#CE1126;}

input,select{
  width:100%;
  background:#f7f9ff;
  border:1.5px solid #dde3f0;
  border-radius:12px;
  color:#1a2036;
  font-family:'Inter',sans-serif;
  font-size:16px;
  font-weight:500;
  padding:14px 16px;
  transition:border-color .2s,background .2s,box-shadow .2s;
  -webkit-appearance:none;
  appearance:none;
  outline:none;
}
select{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M0 0l5.5 7L11 0z' fill='%23003087'/%3E%3C/svg%3E");
  background-repeat:no-repeat;
  background-position:right 15px center;
  background-color:#f7f9ff;
  padding-right:42px;
  cursor:pointer;
}
select option{background:#fff;color:#1a2036;}
input::placeholder{color:#b0b8cc;}
input:focus,select:focus{
  border-color:#003087;
  background:#fff;
  box-shadow:0 0 0 3px rgba(0,48,135,.1);
}
input.err,select.err{
  border-color:#CE1126!important;
  background:#fff5f5!important;
}
.lab-w{position:relative;}
.lab-w .ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:18px;pointer-events:none;}
.lab-w input{padding-left:46px;}

/* ── PASTILLAS PROFESIÓN ── */
.pills{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}
@media(min-width:400px){.pills{grid-template-columns:repeat(4,1fr);}}
.pi{display:none;}
.pl{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
  padding:14px 6px;
  background:#f7f9ff;
  border:2px solid #dde3f0;
  border-radius:14px;
  cursor:pointer;
  text-align:center;
  transition:all .15s;
  user-select:none;
  -webkit-user-select:none;
}
.pl em{font-size:24px;line-height:1;font-style:normal;}
.pl span{font-size:11px;font-weight:600;color:#8896b3;line-height:1.3;}
.pi:checked + .pl{
  background:#e8f0ff;
  border-color:#003087;
}
.pi:checked + .pl span{color:#003087;font-weight:700;}
.pw-err{font-size:11.5px;color:#CE1126;margin-top:6px;display:none;}
.pw.e .pl{border-color:rgba(206,17,38,.35);}
.pw.e .pw-err{display:block;}

/* ── FECHA NACIMIENTO ── */
.dob{display:grid;grid-template-columns:1fr 1.9fr 1fr;gap:10px;}
.dob-f{display:flex;flex-direction:column;gap:5px;}
.dob-s{font-size:9px;color:#a0aabf;text-align:center;letter-spacing:.5px;text-transform:uppercase;}

/* ── TÉRMINOS ── */
.terms{
  display:flex;
  align-items:flex-start;
  gap:12px;
  padding:15px;
  background:#fffbea;
  border:1.5px solid #FFD700;
  border-radius:12px;
}
.terms input[type=checkbox]{
  width:20px;height:20px;min-width:20px;
  accent-color:#003087;
  cursor:pointer;
  margin-top:1px;
}
.terms p{font-size:12px;color:#666;line-height:1.65;}

/* ── ALERTAS ── */
.al{
  border-radius:12px;
  padding:15px 16px;
  font-size:14px;
  line-height:1.55;
  margin-top:14px;
  display:none;
}
.ok{background:#e6f9ee;border:1.5px solid #28a745;color:#155724;}
.er{background:#fdecea;border:1.5px solid #CE1126;color:#7a1020;}

/* ── BOTÓN ── */
.btn{
  width:100%;
  margin-top:18px;
  padding:17px;
  border:none;
  border-radius:14px;
  font-family:'Oswald',sans-serif;
  font-size:18px;
  font-weight:700;
  letter-spacing:2px;
  text-transform:uppercase;
  cursor:pointer;
  background:linear-gradient(90deg,#FFD700,#e88b00 40%,#CE1126);
  color:#fff;
  text-shadow:0 1px 4px rgba(0,0,0,.3);
  box-shadow:0 6px 24px rgba(206,17,38,.25);
  -webkit-appearance:none;
}
.btn:active{opacity:.88;}
.btn:disabled{opacity:.55;cursor:not-allowed;}
.sp{
  display:none;
  width:24px;height:24px;
  border:3px solid rgba(255,255,255,.35);
  border-top-color:#fff;
  border-radius:50%;
  animation:sp .7s linear infinite;
  margin:0 auto;
}
@keyframes sp{to{transform:rotate(360deg);}}

/* ── FOOTER ── */
.foot{
  text-align:center;
  padding:20px 16px 36px;
  font-size:11px;
  color:#a0aabf;
  letter-spacing:1px;
}
.foot b{color:#003087;}
</style>
</head>
<body>

<!-- Barra tricolor sticky -->
<div class="tc">
  <span class="y"></span><span class="b"></span><span class="r"></span>
</div>

<!-- HERO -->
<div class="hero">
  <div class="hero-flags">🇨🇴 ⚽ 🇵🇹</div>
  <div class="badge">🏆 Copa Mundo 2026 · CEISCOL</div>
  <h1>PRE-REGISTRO<br><span class="gold">POLLA MUNDIALISTA</span><br><span class="red">CEISCOL 2026</span></h1>
  <div class="hero-vs">🇨🇴 Colombia &nbsp;•&nbsp; Portugal 🇵🇹</div>
</div>

<!-- CONTENIDO -->
<div class="main">

  <!-- Aviso -->
  <div class="aviso">
    <div class="aviso-i">📲</div>
    <p>Regístrate y <b>recibe el link exclusivo</b> para ingresar tu marcador. ¡Este formulario reserva tu cupo!</p>
  </div>

  <!-- Formulario -->
  <div class="card">
  <form id="F" novalidate>

    <!-- LABORATORIO -->
    <div class="sec">🏥 Laboratorio / Cliente</div>
    <div class="stack">
      <div class="fld">
        <label class="lbl">Nombre del Laboratorio o Cliente <span class="req">*</span></label>
        <div class="lab-w">
          <span class="ico">🏥</span>
          <input type="text" id="lab" placeholder="Lab. Clínico San Rafael" autocomplete="organization"/>
        </div>
      </div>
      <div class="duo">
        <div class="fld">
          <label class="lbl">Ciudad <span class="req">*</span></label>
          <input type="text" id="ciu" placeholder="Bogotá, Cali..."/>
        </div>
        <div class="fld">
          <label class="lbl">Departamento <span class="req">*</span></label>
          <input type="text" id="dpto" placeholder="Cundinamarca..."/>
        </div>
      </div>
    </div>

    <div class="line"></div>

    <!-- PROFESIÓN -->
    <div class="sec">🔬 Profesión <span class="req">*</span></div>
    <div class="pw" id="pw">
      <div class="pills">
        <input class="pi" type="radio" name="prof" id="p1" value="Bacteriólogo/a"/>
        <label class="pl" for="p1"><em>🔬</em><span>Bacteriólogo/a</span></label>
        <input class="pi" type="radio" name="prof" id="p2" value="Auxiliar de Laboratorio"/>
        <label class="pl" for="p2"><em>🧪</em><span>Auxiliar de Lab.</span></label>
        <input class="pi" type="radio" name="prof" id="p3" value="Administrativo/a"/>
        <label class="pl" for="p3"><em>💼</em><span>Administrativo/a</span></label>
        <input class="pi" type="radio" name="prof" id="p4" value="Otro"/>
        <label class="pl" for="p4"><em>👤</em><span>Otro</span></label>
      </div>
      <div class="pw-err">⚠ Selecciona tu profesión</div>
    </div>

    <div class="line"></div>

    <!-- DATOS PERSONALES -->
    <div class="sec">👤 Datos Personales</div>
    <div class="stack">
      <div class="duo">
        <div class="fld">
          <label class="lbl">Nombres <span class="req">*</span></label>
          <input type="text" id="nom" placeholder="Tu(s) nombre(s)" autocomplete="given-name"/>
        </div>
        <div class="fld">
          <label class="lbl">Apellidos <span class="req">*</span></label>
          <input type="text" id="ape" placeholder="Tu(s) apellido(s)" autocomplete="family-name"/>
        </div>
      </div>
      <div class="duo">
        <div class="fld">
          <label class="lbl">Tipo Documento <span class="req">*</span></label>
          <select id="tdoc">
            <option value="">Selecciona...</option>
            <option>Cédula de Ciudadanía</option>
            <option>Cédula de Extranjería</option>
            <option>Pasaporte</option>
            <option>Tarjeta de Identidad</option>
          </select>
        </div>
        <div class="fld">
          <label class="lbl">N° Documento <span class="req">*</span></label>
          <input type="text" id="ndoc" placeholder="Número" inputmode="numeric"/>
        </div>
      </div>
      <div class="fld">
        <label class="lbl">Celular <span class="req">*</span></label>
        <input type="tel" id="cel" placeholder="3XX XXX XXXX" inputmode="tel" autocomplete="tel"/>
      </div>
      <div class="fld">
        <label class="lbl">🎂 Fecha de Nacimiento <span class="req">*</span></label>
        <div class="dob">
          <div class="dob-f">
            <select id="dd"><option value="">Día</option></select>
            <div class="dob-s">Día</div>
          </div>
          <div class="dob-f">
            <select id="dm">
              <option value="">Mes</option>
              <option value="01">Enero</option><option value="02">Febrero</option>
              <option value="03">Marzo</option><option value="04">Abril</option>
              <option value="05">Mayo</option><option value="06">Junio</option>
              <option value="07">Julio</option><option value="08">Agosto</option>
              <option value="09">Septiembre</option><option value="10">Octubre</option>
              <option value="11">Noviembre</option><option value="12">Diciembre</option>
            </select>
            <div class="dob-s">Mes</div>
          </div>
          <div class="dob-f">
            <select id="dy"><option value="">Año</option></select>
            <div class="dob-s">Año</div>
          </div>
        </div>
      </div>
      <div class="fld">
        <label class="lbl">Correo Personal <span class="req">*</span></label>
        <input type="email" id="mail" placeholder="ejemplo@gmail.com" inputmode="email" autocomplete="email"/>
      </div>
      <div class="fld">
        <label class="lbl">Confirmar Correo <span class="req">*</span></label>
        <input type="email" id="mail2" placeholder="Repite tu correo"/>
      </div>
    </div>

    <div class="line"></div>

    <!-- TÉRMINOS -->
    <div class="terms">
      <input type="checkbox" id="trm"/>
      <p>Autorizo el uso de mis datos personales exclusivamente para la Polla Mundialista CEISCOL 2026, conforme a la Ley 1581 de 2012.</p>
    </div>

    <div class="al ok" id="ok">✅ &nbsp;<strong>¡Pre-registro exitoso!</strong> Revisa tu correo — pronto recibes el link. ¡Vamos Colombia! 🇨🇴</div>
    <div class="al er" id="er"><span id="em"></span></div>

    <button type="submit" class="btn" id="btn">
      <span id="bt">⚽ REGISTRARME AHORA</span>
      <div class="sp" id="sp"></div>
    </button>

  </form>
  </div>

</div>

<div class="foot"><b>CEISCOL</b> · Polla Mundialista 2026 · 🇨🇴 Colombia vs Portugal 🇵🇹</div>

<script>
(function(){
  var dd=document.getElementById('dd');
  for(var i=1;i<=31;i++){
    var o=document.createElement('option');
    o.value=o.text=(i<10?'0':'')+i;
    dd.add(o);
  }
  var dy=document.getElementById('dy'),y=new Date().getFullYear();
  for(var j=y-16;j>=y-85;j--){
    var o2=document.createElement('option');
    o2.value=o2.text=j;
    dy.add(o2);
  }
})();

var URL=window.location.href.split('?')[0];

document.getElementById('F').addEventListener('submit',function(e){
  e.preventDefault();
  ocultar();
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
  if(!prof){document.getElementById('pw').classList.add('e');ok=false;}
  if(!dd||!dm||!dy){
    ['dd','dm','dy'].forEach(function(id){if(!v(id))document.getElementById(id).classList.add('err');});
    ok=false;
  }
  if(!ok) return error('Por favor completa todos los campos.');
  if(!mail.includes('@')) return error('El correo no es válido.');
  if(mail!==mail2) return error('Los correos no coinciden.');
  if(cel.replace(/\D/g,'').length<7) return error('El celular no es válido.');
  if(!document.getElementById('trm').checked) return error('Debes aceptar la autorización de datos.');
  cargando(true);
  fetch(URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      laboratorio:lab,ciudad:ciu,dpto:dpto,
      nombres:nom,apellidos:ape,profesion:prof,
      tipo_doc:tdoc,num_doc:ndoc,celular:cel,
      email:mail,fecha_nac:dy+'-'+dm+'-'+dd
    })
  })
  .then(function(r){return r.json();})
  .then(function(r){
    if(r.ok){
      document.getElementById('ok').style.display='block';
      document.getElementById('F').reset();
      window.scrollTo({top:0,behavior:'smooth'});
    } else {
      error('Error del servidor. Intenta de nuevo.');
    }
  })
  .catch(function(){error('Sin conexión. Verifica tu internet.');})
  .finally(function(){cargando(false);});
});

document.querySelectorAll('input,select').forEach(function(el){
  ['input','change'].forEach(function(ev){
    el.addEventListener(ev,function(){el.classList.remove('err');});
  });
});
document.querySelectorAll('input[name=prof]').forEach(function(r){
  r.addEventListener('change',function(){document.getElementById('pw').classList.remove('e');});
});

function v(id){return document.getElementById(id).value.trim();}
function ocultar(){
  document.getElementById('ok').style.display='none';
  document.getElementById('er').style.display='none';
}
function error(m){
  document.getElementById('em').textContent=m;
  document.getElementById('er').style.display='block';
  document.getElementById('er').scrollIntoView({behavior:'smooth',block:'center'});
}
function cargando(on){
  document.getElementById('btn').disabled=on;
  document.getElementById('bt').style.display=on?'none':'inline';
  document.getElementById('sp').style.display=on?'block':'none';
}
</script>
</body>
</html>`;
