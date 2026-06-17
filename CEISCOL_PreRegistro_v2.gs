// ╔══════════════════════════════════════════════════════════════════╗
// ║  POLLA MUNDIALISTA CEISCOL 2026 — PRE-REGISTRO v2              ║
// ║  Profesión · Fecha Nacimiento · Edad automática · Lab cliente  ║
// ║  Pega TODO en script.google.com y publica como Aplicación Web  ║
// ╚══════════════════════════════════════════════════════════════════╝

var REMITENTE_NOMBRE = 'CEISCOL Polla Mundialista 2026';
var EMAIL_CEISCOL    = 'ceiscol.asistente@gmail.com';

// ───────────────────────────────────────────────────────────────────
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

// ── SPREADSHEET ──────────────────────────────────────────────────
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

// ── HOJA REGISTROS ───────────────────────────────────────────────
function darFormatoRegistros(h) {
  h.clearFormats(); h.clearContents();

  // Fila 1: título
  h.setRowHeight(1, 44);
  h.getRange(1,1,1,16).merge()
    .setValue('⚽  POLLA MUNDIALISTA CEISCOL 2026  •  PRE-REGISTROS 🇨🇴 COLOMBIA')
    .setBackground('#CE1126').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(13)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Fila 2: encabezados
  var H = ['#','Fecha','Hora','Cliente / Laboratorio','Ciudad','Dpto',
            'Nombres','Apellidos','Profesión','Tipo Doc','N° Doc',
            'Celular','Correo','Fecha Nacimiento','Edad','Estado Link'];
  h.setRowHeight(2, 34);
  h.getRange(2,1,1,H.length).setValues([H])
    .setBackground('#003087').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Anchos de columna
  var W = [45,85,65,230,120,120,140,140,160,110,110,110,210,120,55,120];
  W.forEach(function(w,i){ h.setColumnWidth(i+1,w); });
  h.setFrozenRows(2);

  // Validación desplegable col 16 (Estado)
  h.getRange(3,16,1000,1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pendiente','Link Enviado','Confirmado','No responde']).build());

  // Formato condicional Estado
  h.setConditionalFormatRules([
    h.newConditionalFormatRule().whenTextEqualTo('Pendiente')
      .setBackground('#FFF3CD').setFontColor('#856404').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Link Enviado')
      .setBackground('#D1ECF1').setFontColor('#0C5460').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Confirmado')
      .setBackground('#D4EDDA').setFontColor('#155724').setRanges([h.getRange(3,16,1000,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('No responde')
      .setBackground('#F8D7DA').setFontColor('#721C24').setRanges([h.getRange(3,16,1000,1)]).build()
  ]);

  h.getRange(2,1,1,H.length)
    .setBorder(true,true,true,true,true,true,'#FFD700',SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

// ── HOJA MENSAJES ─────────────────────────────────────────────────
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

// ── HOJA DASHBOARD ────────────────────────────────────────────────
function crearHojaDashboard(ss) {
  var h = ss.insertSheet('Dashboard');
  h.setRowHeight(1,52);
  h.getRange(1,1,1,5).merge()
    .setValue('🏆  DASHBOARD — POLLA MUNDIALISTA CEISCOL 2026')
    .setBackground('#CE1126').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(15)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  var rows = [
    ['TOTAL REGISTROS',   '=COUNTA(Registros!G3:G)',                    '#003087'],
    ['LINKS ENVIADOS',    '=COUNTIF(Registros!P3:P,"Link Enviado")',    '#0077B6'],
    ['CONFIRMADOS',       '=COUNTIF(Registros!P3:P,"Confirmado")',      '#28A745'],
    ['PENDIENTES',        '=COUNTIF(Registros!P3:P,"Pendiente")',       '#E67E22'],
    ['MENSAJES ENVIADOS', '=COUNTA(Mensajes!E3:E)',                      '#6F42C1'],
    ['EDAD PROMEDIO',     '=IFERROR(ROUND(AVERAGE(Registros!O3:O),1),"—")', '#555'],
    ['ACTUALIZACIÓN',     '=TEXT(NOW(),"DD/MM/YYYY HH:MM")',             '#333'],
  ];

  rows.forEach(function(r,i){
    var fila = i+3;
    h.setRowHeight(fila, 58);
    h.getRange(fila,2).setValue(r[0])
      .setBackground(r[2]).setFontColor('#fff')
      .setFontWeight('bold').setFontSize(11)
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    h.getRange(fila,3).setFormula(r[1])
      .setBackground('#F8F9FF').setFontColor(r[2])
      .setFontWeight('bold').setFontSize(24)
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
  });
  h.setColumnWidth(1,20); h.setColumnWidth(2,210); h.setColumnWidth(3,130);
  h.getRange(3,2,rows.length,2)
    .setBorder(true,true,true,true,true,true,'#ddd',SpreadsheetApp.BorderStyle.SOLID);
}

// ── GUARDAR REGISTRO ──────────────────────────────────────────────
function guardarRegistro(ss, d) {
  var h     = ss.getSheetByName('Registros');
  var lastR = Math.max(h.getLastRow(), 2);
  var num   = lastR - 1;
  var ahora = new Date();
  var newR  = lastR + 1;

  // Fecha de nacimiento como Date para fórmula de edad
  var fnac = d.fecha_nac ? new Date(d.fecha_nac + 'T00:00:00') : '';

  h.appendRow([
    num,
    Utilities.formatDate(ahora,'America/Bogota','dd/MM/yyyy'),
    Utilities.formatDate(ahora,'America/Bogota','HH:mm:ss'),
    d.laboratorio,
    d.ciudad,
    d.dpto,
    d.nombres,
    d.apellidos,
    d.profesion,
    d.tipo_doc,
    d.num_doc,
    d.celular,
    d.email,
    fnac || '',   // col 14: Fecha Nacimiento
    '',           // col 15: Edad — fórmula abajo
    'Pendiente'   // col 16: Estado
  ]);

  // Formato fecha nacimiento
  if (fnac) {
    h.getRange(newR,14).setNumberFormat('dd/mm/yyyy');
    // Fórmula edad automática
    h.getRange(newR,15).setFormula('=IF(N'+newR+'<>"",DATEDIF(N'+newR+',TODAY(),"Y"),"")');
    h.getRange(newR,15).setHorizontalAlignment('center').setFontWeight('bold').setFontColor('#003087');
  }

  // Fila alternada
  var bg = (num % 2 === 0) ? '#EEF2FB' : '#FFFFFF';
  h.getRange(newR,1,1,16).setBackground(bg).setFontSize(10).setVerticalAlignment('middle');
  h.getRange(newR,1).setFontWeight('bold').setFontColor('#CE1126').setHorizontalAlignment('center');
  h.getRange(newR,4).setFontWeight('bold').setFontColor('#003087');  // lab destacado
  h.setRowHeight(newR, 26);

  return num;
}

// ── REGISTRAR MENSAJE ─────────────────────────────────────────────
function registrarMensaje(ss, d, num) {
  var h    = ss.getSheetByName('Mensajes');
  var msgN = Math.max(h.getLastRow()-1, 0)+1;
  var now  = new Date();
  h.appendRow([
    msgN,
    Utilities.formatDate(now,'America/Bogota','dd/MM/yyyy'),
    Utilities.formatDate(now,'America/Bogota','HH:mm:ss'),
    d.nombres+' '+d.apellidos,
    d.email,
    'Confirmación Pre-registro',
    'Pre-registro Polla CEISCOL 2026 — Confirmación',
    '✅ Enviado',
    num
  ]);
  var fil = h.getLastRow();
  h.getRange(fil,1,1,9)
    .setBackground(msgN%2===0?'#F0F4FF':'#FFFFFF')
    .setFontSize(10).setVerticalAlignment('middle');
  h.setRowHeight(fil,24);
}

// ── CORREO AL PARTICIPANTE + NOTIFICACIÓN CEISCOL ─────────────────
function enviarConfirmacion(d) {
  var nombre = d.nombres+' '+d.apellidos;
  var fnacFmt = '';
  if (d.fecha_nac) {
    var p = d.fecha_nac.split('-');
    fnacFmt = p[2]+'/'+p[1]+'/'+p[0];
  }

  var html =
   '<!DOCTYPE html><html><head><meta charset="UTF-8">'
  +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#f0f2f5;}'
  +'.w{max-width:580px;margin:20px auto;border-radius:14px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,.15);}'
  +'</style></head><body>'
  +'<div class="w">'
  // Banda tricolor
  +'<div style="display:flex;height:7px;"><div style="flex:1;background:#FFD700"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#CE1126"></div></div>'
  // Hero
  +'<div style="background:linear-gradient(135deg,#001a5e 0%,#003087 50%,#8b0000 100%);padding:36px 28px;text-align:center;">'
  +'<div style="font-size:56px;">⚽</div>'
  +'<h1 style="color:#FFD700;font-size:23px;font-weight:700;margin-top:10px;">¡Ya estás inscrito!</h1>'
  +'<p style="color:rgba(255,255,255,.8);font-size:13px;margin-top:5px;">Polla Mundialista CEISCOL 2026</p>'
  +'<p style="color:rgba(255,255,255,.5);font-size:11px;margin-top:3px;letter-spacing:1px;">🇨🇴 COLOMBIA vs PORTUGAL 🇵🇹</p>'
  +'</div>'
  // Cuerpo
  +'<div style="background:#fff;padding:30px 28px;">'
  +'<p style="font-size:15px;color:#1a1a2e;">Hola <b style="color:#003087;">'+nombre+'</b>,</p>'
  +'<p style="font-size:14px;color:#555;line-height:1.7;margin-top:10px;">Tu inscripción en la <b>Polla Mundialista CEISCOL 2026</b> fue registrada con éxito. 🎉</p>'
  // Aviso link
  +'<div style="background:linear-gradient(135deg,#fffbea,#fff3cd);border:2px solid #FFD700;border-radius:12px;padding:22px;margin:22px 0;text-align:center;">'
  +'<div style="font-size:36px;">📲</div>'
  +'<p style="font-size:16px;font-weight:700;color:#003087;margin-top:10px;">Próximamente recibirás el link</p>'
  +'<p style="font-size:13px;color:#666;line-height:1.6;margin-top:8px;">Te enviaremos a este correo el <b>link exclusivo</b> desde donde podrás <b>ingresar tu marcador</b> y participar oficialmente en la polla. Este pre-registro te reserva tu cupo. <b>¡Mantente atento!</b></p>'
  +'</div>'
  // Tabla datos
  +'<table style="width:100%;border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;">'
  +'<tr><th colspan="2" style="background:#003087;color:#FFD700;padding:10px 14px;text-align:left;font-size:11px;letter-spacing:1.5px;">📋 TUS DATOS REGISTRADOS</th></tr>'
  +'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;width:42%;">🏥 Laboratorio / Cliente</td><td style="padding:9px 14px;font-weight:700;color:#003087;">'+d.laboratorio+'</td></tr>'
  +'<tr><td style="padding:9px 14px;color:#888;">📍 Ciudad</td><td style="padding:9px 14px;">'+d.ciudad+' — '+d.dpto+'</td></tr>'
  +'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;">👤 Nombre</td><td style="padding:9px 14px;font-weight:600;">'+nombre+'</td></tr>'
  +'<tr><td style="padding:9px 14px;color:#888;">🔬 Profesión</td><td style="padding:9px 14px;">'+d.profesion+'</td></tr>'
  +'<tr style="background:#f8f9ff;"><td style="padding:9px 14px;color:#888;">📱 Celular</td><td style="padding:9px 14px;">'+d.celular+'</td></tr>'
  +(fnacFmt?'<tr><td style="padding:9px 14px;color:#888;">🎂 Fecha Nac.</td><td style="padding:9px 14px;">'+fnacFmt+'</td></tr>':'')
  +'</table>'
  +'<p style="font-size:12px;color:#bbb;margin-top:24px;text-align:center;">¡Vamos Colombia! 💛💙❤️ &bull; CEISCOL 2026</p>'
  +'</div>'
  // Pie tricolor
  +'<div style="display:flex;height:7px;"><div style="flex:1;background:#CE1126"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#FFD700"></div></div>'
  +'</div></body></html>';

  MailApp.sendEmail({ to: d.email, subject: '⚽ ¡Inscripción exitosa! Polla Mundialista CEISCOL 2026', htmlBody: html, name: REMITENTE_NOMBRE });

  // Notificación interna
  MailApp.sendEmail({
    to: EMAIL_CEISCOL,
    subject: '🔔 Nuevo pre-registro: '+nombre+' | '+d.laboratorio,
    htmlBody:
     '<div style="font-family:Arial;max-width:540px;padding:20px;">'
    +'<h2 style="color:#003087;">⚽ Nuevo pre-registro recibido</h2>'
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
//  HTML DEL FORMULARIO — COMPLETO
// ═══════════════════════════════════════════════════════════════════
var HTML_FORM = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Pre-Registro Polla Mundialista CEISCOL 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  font-family:'Inter',sans-serif;
  background:#0d1117;
  min-height:100vh;
  color:#e8eaf0;
  background-image:
    radial-gradient(ellipse at 15% 10%,rgba(255,215,0,.07) 0%,transparent 45%),
    radial-gradient(ellipse at 85% 90%,rgba(206,17,38,.08) 0%,transparent 45%),
    radial-gradient(ellipse at 50% 50%,rgba(0,48,135,.1) 0%,transparent 60%);
}

/* tricolor fija */
.tc{display:flex;height:5px;position:fixed;top:0;left:0;right:0;z-index:200;}
.tc div{flex:1;}
.tc .y{background:#FFD700;}
.tc .b{background:#003087;}
.tc .r{background:#CE1126;}

/* ── HERO ── */
.hero{
  padding:46px 20px 62px;
  text-align:center;
  position:relative;
  overflow:hidden;
  background:linear-gradient(155deg,#001233 0%,#003087 40%,#5c0000 75%,#CE1126 100%);
}
.hero::before{
  content:'';
  position:absolute;inset:0;
  background:repeating-linear-gradient(45deg,
    rgba(255,255,255,.018) 0,rgba(255,255,255,.018) 1px,
    transparent 1px,transparent 20px);
}
.orb{
  position:absolute;border-radius:50%;
  border:1.5px solid rgba(255,215,0,.12);
  animation:breathe 4s ease-in-out infinite;
}
.orb:nth-child(1){width:220px;height:220px;top:-60px;left:-60px;animation-delay:0s;}
.orb:nth-child(2){width:140px;height:140px;bottom:-30px;right:-30px;animation-delay:1.3s;border-color:rgba(206,17,38,.18);}
.orb:nth-child(3){width:90px;height:90px;top:30%;right:4%;animation-delay:2.5s;}
@keyframes breathe{
  0%,100%{transform:scale(1);opacity:.3}
  50%{transform:scale(1.1);opacity:.7}
}
.hero-inner{position:relative;z-index:1;}
.hero-flags{font-size:44px;line-height:1;margin-bottom:6px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5));}
.pill{
  display:inline-flex;align-items:center;gap:7px;
  background:rgba(255,215,0,.1);
  border:1px solid rgba(255,215,0,.3);
  border-radius:30px;padding:5px 18px;
  font-size:10px;color:#FFD700;
  letter-spacing:2.5px;text-transform:uppercase;
  font-weight:600;margin-bottom:18px;
}
.hero h1{
  font-family:'Oswald',sans-serif;
  font-size:clamp(26px,7vw,50px);
  font-weight:700;color:#fff;
  line-height:1.12;letter-spacing:.5px;
}
.hero h1 .g{color:#FFD700;}
.hero h1 .r{color:#FF5555;}
.hero-sub{
  font-size:11.5px;color:rgba(255,255,255,.5);
  margin-top:9px;letter-spacing:1.2px;
  text-transform:uppercase;
}

/* ── BANNER INFO ── */
.banner-wrap{max-width:620px;margin:-30px auto 0;padding:0 16px;position:relative;z-index:10;}
.banner{
  background:linear-gradient(135deg,rgba(255,215,0,.1),rgba(0,48,135,.15));
  border:1.5px solid rgba(255,215,0,.28);
  border-radius:14px;padding:15px 18px;
  display:flex;gap:13px;align-items:flex-start;
}
.banner-ico{font-size:30px;flex-shrink:0;margin-top:1px;}
.banner-txt h3{font-size:13px;font-weight:600;color:#FFD700;margin-bottom:5px;}
.banner-txt p{font-size:11.5px;color:rgba(255,255,255,.6);line-height:1.65;}
.banner-txt b{color:rgba(255,215,0,.9);}

/* ── FORMULARIO ── */
.fw{max-width:620px;margin:22px auto 0;padding:0 16px 50px;}
.card{
  background:rgba(18,24,42,.92);
  backdrop-filter:blur(16px);
  border:1px solid rgba(255,215,0,.13);
  border-radius:18px;padding:28px 24px;
  box-shadow:0 28px 70px rgba(0,0,0,.55);
}
.sec{
  font-family:'Oswald',sans-serif;
  font-size:11px;letter-spacing:3px;
  color:#FFD700;text-transform:uppercase;
  margin-bottom:16px;
  display:flex;align-items:center;gap:10px;
}
.sec::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(255,215,0,.4),transparent);}
.div{height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,.2),transparent);margin:22px 0;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:500px){.g2{grid-template-columns:1fr;}}
.f{display:flex;flex-direction:column;gap:6px;}
.f.full{grid-column:1/-1;}
label{
  font-size:10px;font-weight:600;
  color:rgba(255,255,255,.38);
  letter-spacing:1.3px;text-transform:uppercase;
}
label .r{color:#FFD700;margin-left:2px;}

/* Inputs & selects */
input,select{
  background:rgba(255,255,255,.04);
  border:1.5px solid rgba(255,255,255,.1);
  border-radius:9px;color:#e8eaf0;
  font-size:14px;padding:12px 14px;
  width:100%;font-family:'Inter',sans-serif;
  transition:border-color .2s,box-shadow .2s,background .2s;
  -webkit-appearance:none;
}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23FFD700' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;}
select option{background:#1a2236;color:#e8eaf0;}
input[type=date]{color-scheme:dark;}
input::placeholder{color:rgba(255,255,255,.2);}
input:focus,select:focus{
  outline:none;
  border-color:rgba(255,215,0,.6);
  box-shadow:0 0 0 3px rgba(255,215,0,.09);
  background:rgba(255,255,255,.07);
}
input.err,select.err{
  border-color:#CE1126!important;
  box-shadow:0 0 0 3px rgba(206,17,38,.13)!important;
}

/* ── FECHA NACIMIENTO ── */
.dob-row{display:grid;grid-template-columns:1fr 2fr 1fr;gap:10px;}
.dob-label{
  font-size:9px;text-align:center;
  color:rgba(255,255,255,.28);
  margin-top:4px;letter-spacing:.5px;
  text-transform:uppercase;
}

/* ── PROFESIÓN CARDS ── */
.prof-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(130px,1fr));
  gap:10px;
  margin-top:2px;
}
.prof-opt{display:none;}
.prof-lbl{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  background:rgba(255,255,255,.04);
  border:1.5px solid rgba(255,255,255,.1);
  border-radius:11px;padding:14px 10px;
  cursor:pointer;
  transition:all .18s;
  text-align:center;
}
.prof-lbl .ico{font-size:26px;}
.prof-lbl .txt{
  font-size:11px;font-weight:500;
  color:rgba(255,255,255,.55);
  line-height:1.35;
}
.prof-opt:checked + .prof-lbl{
  background:rgba(255,215,0,.12);
  border-color:#FFD700;
  box-shadow:0 0 0 3px rgba(255,215,0,.1);
}
.prof-opt:checked + .prof-lbl .txt{color:#FFD700;}
.prof-border.err .prof-lbl{
  border-color:rgba(206,17,38,.5)!important;
}

/* ── LAB HIGHLIGHT ── */
.lab-wrap{
  position:relative;
}
.lab-wrap input{
  padding-left:42px;
  border-color:rgba(255,215,0,.25);
  font-size:14.5px;
  font-weight:500;
}
.lab-wrap::before{
  content:'🏥';
  position:absolute;
  left:13px;top:50%;
  transform:translateY(-50%);
  font-size:16px;
}

/* ── TERMS ── */
.terms{display:flex;align-items:flex-start;gap:11px;margin-top:4px;}
.terms input[type=checkbox]{width:18px;height:18px;min-width:18px;accent-color:#FFD700;cursor:pointer;margin-top:2px;}
.terms label{text-transform:none;letter-spacing:0;font-size:12px;color:rgba(255,255,255,.38);line-height:1.6;}

/* ── ALERTS ── */
.alert{border-radius:11px;padding:15px 18px;font-size:13.5px;line-height:1.55;margin-top:16px;display:none;}
.ok-msg{background:rgba(40,167,69,.1);border:1px solid rgba(40,167,69,.35);color:#6fcf97;}
.nok-msg{background:rgba(206,17,38,.1);border:1px solid rgba(206,17,38,.35);color:#ff8080;}

/* ── BOTÓN ── */
.btn{
  width:100%;padding:16px;margin-top:22px;
  border:none;border-radius:11px;cursor:pointer;
  font-family:'Oswald',sans-serif;
  font-size:18px;font-weight:700;letter-spacing:2px;
  text-transform:uppercase;transition:all .2s;
  position:relative;overflow:hidden;
  background:linear-gradient(90deg,#FFD700 0%,#FF8C00 50%,#CE1126 100%);
  color:#fff;
  text-shadow:0 1px 4px rgba(0,0,0,.35);
  box-shadow:0 5px 24px rgba(206,17,38,.35);
}
.btn::after{
  content:'';
  position:absolute;inset:0;
  background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.18) 50%,transparent 100%);
  transform:translateX(-100%);
  transition:transform .55s;
}
.btn:hover::after{transform:translateX(100%);}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(206,17,38,.5);}
.btn:active{transform:translateY(0);}
.btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.spin{
  display:none;width:22px;height:22px;
  border:3px solid rgba(255,255,255,.25);
  border-top-color:#fff;
  border-radius:50%;animation:sp .7s linear infinite;
  margin:0 auto;
}
@keyframes sp{to{transform:rotate(360deg)}}

footer{
  text-align:center;padding:22px 16px;
  font-size:10px;color:rgba(255,255,255,.18);
  letter-spacing:1px;
}
footer strong{color:rgba(255,215,0,.4);}
</style>
</head>
<body>

<!-- Tricolor fija -->
<div class="tc"><div class="y"></div><div class="b"></div><div class="r"></div></div>

<!-- HERO -->
<div class="hero">
  <div class="orb"></div><div class="orb"></div><div class="orb"></div>
  <div class="hero-inner">
    <div class="hero-flags">🇨🇴 ⚽ 🇵🇹</div>
    <div class="pill">🏆 Copa Mundo 2026 &nbsp;|&nbsp; CEISCOL</div>
    <h1>PRE-REGISTRO<br><span class="g">POLLA MUNDIALISTA</span><br><span class="r">CEISCOL 2026</span></h1>
    <p class="hero-sub">Colombia 🇨🇴 vs Portugal 🇵🇹 &bull; Solo para bacteriólogos</p>
  </div>
</div>

<!-- BANNER -->
<div class="banner-wrap">
  <div class="banner">
    <div class="banner-ico">📲</div>
    <div class="banner-txt">
      <h3>¿Cómo funciona?</h3>
      <p>Regístrate aquí con tus datos. <b>Próximamente recibirás en tu correo el link exclusivo</b> desde donde podrás ingresar tu marcador y participar oficialmente. Este formulario reserva tu cupo. <b>¡Mantente atento!</b></p>
    </div>
  </div>
</div>

<!-- FORMULARIO -->
<div class="fw">
<div class="card">
<form id="frm" novalidate>

  <!-- SECCIÓN: LABORATORIO / CLIENTE -->
  <div class="sec">🏥 Laboratorio / Cliente</div>
  <div class="g2">
    <div class="f full">
      <label>Nombre del Laboratorio o Cliente <span class="r">*</span></label>
      <div class="lab-wrap">
        <input type="text" id="lab" placeholder="Ej. Laboratorio Clínico San Rafael" required/>
      </div>
    </div>
    <div class="f">
      <label>Ciudad / Municipio <span class="r">*</span></label>
      <input type="text" id="ciu" placeholder="Bogotá, Cali..." required/>
    </div>
    <div class="f">
      <label>Departamento <span class="r">*</span></label>
      <input type="text" id="dpto" placeholder="Cundinamarca..." required/>
    </div>
  </div>

  <div class="div"></div>

  <!-- SECCIÓN: PROFESIÓN -->
  <div class="sec">🔬 Profesión</div>
  <div class="prof-border" id="prof-border">
    <div class="prof-grid">
      <div>
        <input class="prof-opt" type="radio" name="profesion" id="p1" value="Bacteriólogo"/>
        <label class="prof-lbl" for="p1"><span class="ico">🧑‍🔬</span><span class="txt">Bacteriólogo</span></label>
      </div>
      <div>
        <input class="prof-opt" type="radio" name="profesion" id="p2" value="Bacterióloga"/>
        <label class="prof-lbl" for="p2"><span class="ico">👩‍🔬</span><span class="txt">Bacterióloga</span></label>
      </div>
      <div>
        <input class="prof-opt" type="radio" name="profesion" id="p3" value="Auxiliar de Laboratorio"/>
        <label class="prof-lbl" for="p3"><span class="ico">🧪</span><span class="txt">Auxiliar de Laboratorio</span></label>
      </div>
      <div>
        <input class="prof-opt" type="radio" name="profesion" id="p4" value="Administrativo"/>
        <label class="prof-lbl" for="p4"><span class="ico">💼</span><span class="txt">Administrativo</span></label>
      </div>
      <div>
        <input class="prof-opt" type="radio" name="profesion" id="p5" value="Otro"/>
        <label class="prof-lbl" for="p5"><span class="ico">👤</span><span class="txt">Otro</span></label>
      </div>
    </div>
  </div>

  <div class="div"></div>

  <!-- SECCIÓN: DATOS PERSONALES -->
  <div class="sec">👤 Datos Personales</div>
  <div class="g2">
    <div class="f">
      <label>Nombres <span class="r">*</span></label>
      <input type="text" id="nom" placeholder="Tu(s) nombre(s)" required/>
    </div>
    <div class="f">
      <label>Apellidos <span class="r">*</span></label>
      <input type="text" id="ape" placeholder="Tu(s) apellido(s)" required/>
    </div>
    <div class="f">
      <label>Tipo de Documento <span class="r">*</span></label>
      <select id="tdoc">
        <option value="">Selecciona...</option>
        <option>Cédula de Ciudadanía</option>
        <option>Cédula de Extranjería</option>
        <option>Pasaporte</option>
        <option>Tarjeta de Identidad</option>
      </select>
    </div>
    <div class="f">
      <label>Número de Documento <span class="r">*</span></label>
      <input type="text" id="ndoc" placeholder="Número" required/>
    </div>
    <div class="f">
      <label>Celular <span class="r">*</span></label>
      <input type="tel" id="cel" placeholder="3XXXXXXXXX" required/>
    </div>
    <div class="f">
      <label>🎂 Fecha de Nacimiento <span class="r">*</span></label>
      <div class="dob-row">
        <div>
          <select id="dob-d"><option value="">Día</option></select>
          <div class="dob-label">Día</div>
        </div>
        <div>
          <select id="dob-m">
            <option value="">Mes</option>
            <option value="01">Enero</option><option value="02">Febrero</option>
            <option value="03">Marzo</option><option value="04">Abril</option>
            <option value="05">Mayo</option><option value="06">Junio</option>
            <option value="07">Julio</option><option value="08">Agosto</option>
            <option value="09">Septiembre</option><option value="10">Octubre</option>
            <option value="11">Noviembre</option><option value="12">Diciembre</option>
          </select>
          <div class="dob-label">Mes</div>
        </div>
        <div>
          <select id="dob-y"><option value="">Año</option></select>
          <div class="dob-label">Año</div>
        </div>
      </div>
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

  <div class="div"></div>

  <!-- TERMS -->
  <div class="terms">
    <input type="checkbox" id="trm"/>
    <label for="trm">Autorizo el uso de mis datos personales exclusivamente para la Polla Mundialista CEISCOL 2026 y el envío de comunicaciones relacionadas con este evento, conforme a la Ley 1581 de 2012 de protección de datos personales.</label>
  </div>

  <div class="alert ok-msg" id="ok">✅ &nbsp;<strong>¡Pre-registro exitoso!</strong> Revisa tu correo para confirmar. Cuando el link esté listo te lo enviaremos. ¡Vamos Colombia! 🇨🇴</div>
  <div class="alert nok-msg" id="nok"><span id="etxt">Error al enviar.</span></div>

  <button type="submit" class="btn" id="btn">
    <span id="btxt">⚽&nbsp; REGISTRARME PARA LA POLLA</span>
    <div class="spin" id="spn"></div>
  </button>

</form>
</div>
</div>

<footer>
  <strong>CEISCOL</strong> &bull; Polla Mundialista 2026 &bull; Solo para bacteriólogos registrados<br>
  🇨🇴 Colombia vs Portugal 🇵🇹 &bull; ¡Vamos la Tricolor!
</footer>

<script>
// Poblar días
(function(){
  var d = document.getElementById('dob-d');
  for(var i=1;i<=31;i++){var o=document.createElement('option');o.value=(i<10?'0':'')+i;o.text=(i<10?'0':'')+i;d.add(o);}
  var y = document.getElementById('dob-y');
  var ay = new Date().getFullYear();
  for(var j=ay-16;j>=ay-90;j--){var o2=document.createElement('option');o2.value=j;o2.text=j;y.add(o2);}
})();

var SELF = window.location.href.split('?')[0];

document.getElementById('frm').addEventListener('submit', function(e){
  e.preventDefault();
  hide();

  var lab   = v('lab'),  ciu  = v('ciu'),  dpto = v('dpto');
  var nom   = v('nom'),  ape  = v('ape');
  var tdoc  = v('tdoc'), ndoc = v('ndoc');
  var cel   = v('cel'),  mail = v('mail'), mail2 = v('mail2');
  var dDay  = v('dob-d'),dMon = v('dob-m'), dYr  = v('dob-y');
  var prof  = '';
  document.querySelectorAll('input[name=profesion]').forEach(function(r){if(r.checked)prof=r.value;});

  // validar
  var ok = true;
  ['lab','ciu','dpto','nom','ape','tdoc','ndoc','cel','mail','mail2'].forEach(function(id){
    if(!v(id)){document.getElementById(id).classList.add('err');ok=false;}
  });
  if(!prof){
    document.getElementById('prof-border').classList.add('err');
    ok=false;
  }
  if(!dDay||!dMon||!dYr){
    ['dob-d','dob-m','dob-y'].forEach(function(id){
      if(!v(id))document.getElementById(id).classList.add('err');
    });
    ok=false;
  }
  if(!ok){err('Por favor completa todos los campos obligatorios.');return;}
  if(!mail.includes('@')){err('El correo no es válido.');return;}
  if(mail!==mail2){err('Los correos no coinciden. Verifícalos.');return;}
  if(cel.replace(/\D/g,'').length<7){err('Ingresa un celular válido.');return;}
  if(!document.getElementById('trm').checked){err('Debes aceptar la autorización de datos.');return;}

  load(true);

  var fnac = dYr+'-'+dMon+'-'+dDay;
  var datos = {
    laboratorio: lab,
    ciudad: ciu,
    dpto: dpto,
    nombres: nom,
    apellidos: ape,
    profesion: prof,
    tipo_doc: tdoc,
    num_doc: ndoc,
    celular: cel,
    email: mail,
    fecha_nac: fnac
  };

  fetch(SELF,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)})
    .then(function(r){return r.json();})
    .then(function(r){
      if(r.ok){
        document.getElementById('ok').style.display='block';
        document.getElementById('frm').reset();
        document.querySelectorAll('input[name=profesion]').forEach(function(r){r.checked=false;});
        window.scrollTo({top:0,behavior:'smooth'});
      } else { err('Error del servidor. Intenta de nuevo.'); }
    })
    .catch(function(){err('Sin conexión. Verifica tu internet.');})
    .finally(function(){load(false);});
});

// Limpiar errores
document.querySelectorAll('input,select').forEach(function(el){
  el.addEventListener('change',function(){el.classList.remove('err');});
  el.addEventListener('input', function(){el.classList.remove('err');});
});
document.querySelectorAll('input[name=profesion]').forEach(function(r){
  r.addEventListener('change',function(){
    document.getElementById('prof-border').classList.remove('err');
  });
});

function v(id){return document.getElementById(id).value.trim();}
function hide(){
  document.getElementById('ok').style.display='none';
  document.getElementById('nok').style.display='none';
}
function err(m){
  document.getElementById('etxt').textContent=m;
  document.getElementById('nok').style.display='block';
  document.getElementById('nok').scrollIntoView({behavior:'smooth',block:'center'});
}
function load(on){
  document.getElementById('btn').disabled=on;
  document.getElementById('btxt').style.display=on?'none':'inline';
  document.getElementById('spn').style.display=on?'block':'none';
}
</script>
</body>
</html>`;
