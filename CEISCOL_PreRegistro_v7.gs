var REMITENTE_NOMBRE = 'CEISCOL Polla Mundialista 2026';
var EMAIL_CEISCOL    = 'ceiscol.concursos@gmail.com';

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

// ─────────────────────────────────────────────────────────────────
var HTML_FORM = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<title>Pre-Registro · Polla Mundialista CEISCOL 2026</title>
<style>

/* ══ BASE ══ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  height: 100%;
  -webkit-text-size-adjust: 100%;
}
body {
  min-height: 100%;
  width: 100%;
  overflow-x: hidden;
  background: #F4F6FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  font-size: 16px;
  color: #1A1D23;
  -webkit-font-smoothing: antialiased;
}

/* ══ CABECERA ══ */
.header {
  background: linear-gradient(150deg, #001B4E 0%, #003087 55%, #7A0018 100%);
  padding: 40px 20px 56px;
  text-align: center;
}
.header-ico { font-size: 46px; line-height: 1; margin-bottom: 12px; }
.header-badge {
  display: inline-block;
  border: 1.5px solid rgba(255,215,0,.55);
  background: rgba(255,215,0,.1);
  color: #FFD700;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  padding: 5px 18px;
  border-radius: 100px;
  margin-bottom: 16px;
}
.header h1 {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.header h1 span { color: #FFD700; display: block; }
.header-match {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 100px;
  padding: 10px 24px;
  color: rgba(255,255,255,.9);
  font-size: 16px;
  font-weight: 600;
}

/* ══ CONTENIDO ══ */
.content {
  padding: 0 0 60px;
}

/* ══ TARJETA AVISO ══ */
.notice {
  margin: -28px 16px 0;
  position: relative;
  z-index: 10;
  background: #fff;
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,.12);
  border-left: 5px solid #FFD700;
}
.notice .ico { font-size: 30px; flex-shrink: 0; }
.notice p { font-size: 15px; color: #374151; line-height: 1.55; font-weight: 500; }
.notice b { color: #003087; }

/* ══ SECCIÓN ══ */
.section {
  margin: 24px 16px 0;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 20px rgba(0,0,0,.07);
}
.section-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid #F0F2F8;
  display: flex;
  align-items: center;
  gap: 12px;
}
.sec-num {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: #003087;
  color: #FFD700;
  font-size: 14px;
  font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sec-title {
  font-size: 17px;
  font-weight: 800;
  color: #111827;
}

/* ══ CAMPO — un campo por fila, ancho 100% ══ */
.field {
  padding: 0 20px;
  border-bottom: 1px solid #F0F2F8;
}
.field:last-child { border-bottom: none; }
.field label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #6B7280;
  padding-top: 16px;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  -webkit-user-select: none;
  user-select: none;
}
.field label .req { color: #EF4444; margin-left: 2px; }

/*
  ANTI-ZOOM iOS:
  font-size >= 16px -> Safari no hace zoom automatico al enfocar
  touch-action: manipulation -> evita doble-tap zoom
*/
.field input,
.field select {
  display: block;
  width: 100%;
  height: 52px;
  padding: 0 16px;
  margin-bottom: 14px;
  background: #F8F9FC;
  border: 1.5px solid #DDE3F0;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  font-weight: 500;
  color: #1A1D23;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.field input:focus,
.field select:focus {
  border-color: #003087;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(0,48,135,.1);
}
.field input.err,
.field select.err {
  border-color: #EF4444 !important;
  background: #FEF2F2 !important;
  box-shadow: 0 0 0 4px rgba(239,68,68,.1) !important;
}
.field input::placeholder { color: #A0AABA; font-weight: 400; }

.field select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%236B7280' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 20px;
  background-color: #F8F9FC;
  padding-right: 46px;
  cursor: pointer;
}
.field select option { font-size: 16px; color: #1A1D23; background: #fff; }
.field select:disabled { opacity: .4; cursor: not-allowed; }

/* ══ PASTILLAS — profesion ══ */
.pills-box { padding: 16px 20px 20px; }
.pills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pi { display: none; }
.pl {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 84px;
  padding: 16px 8px;
  background: #F8F9FC;
  border: 1.5px solid #DDE3F0;
  border-radius: 16px;
  cursor: pointer;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: border-color .13s, background .13s, box-shadow .13s;
}
.pl .pi-ico { font-size: 28px; line-height: 1; }
.pl .pi-txt { font-size: 14px; font-weight: 700; color: #6B7280; line-height: 1.3; }
.pi:checked + .pl {
  background: #EEF3FF;
  border-color: #003087;
  box-shadow: 0 0 0 3px rgba(0,48,135,.15);
}
.pi:checked + .pl .pi-txt { color: #003087; }
.pills-err { display: none; font-size: 14px; color: #EF4444; padding: 4px 0 0; }
.pills-box.err .pills-err { display: block; }
.pills-box.err .pl { border-color: rgba(239,68,68,.4); }

/* ══ TERMINOS ══ */
.terms-card {
  margin: 20px 16px 0;
  background: #FFFBEB;
  border-radius: 18px;
  border: 1.5px solid #FDE68A;
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  box-shadow: 0 2px 12px rgba(0,0,0,.05);
}
.terms-card input[type=checkbox] {
  width: 24px; height: 24px; min-width: 24px;
  accent-color: #003087;
  cursor: pointer;
  touch-action: manipulation;
  margin-top: 2px;
  border-radius: 6px;
}
.terms-card p { font-size: 14px; color: #4B5563; line-height: 1.65; }
.terms-card strong { color: #003087; }

/* ══ ALERTAS ══ */
.alert {
  margin: 16px 16px 0;
  border-radius: 14px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  display: none;
}
.alert-ok { background: #ECFDF5; border: 1.5px solid #10B981; color: #064E3B; }
.alert-er { background: #FEF2F2; border: 1.5px solid #EF4444; color: #7F1D1D; }

/* ══ BOTON ══ */
.btn-area { padding: 22px 16px 52px; }
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 60px;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 900;
  font-family: inherit;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  background: linear-gradient(110deg, #002566 0%, #003087 40%, #0047D4 100%);
  color: #FFD700;
  box-shadow: 0 8px 28px rgba(0,48,135,.4);
  -webkit-appearance: none;
  touch-action: manipulation;
  transition: opacity .15s, transform .1s;
}
.btn:active { opacity: .87; transform: scale(.99); }
.btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
.spinner {
  display: none;
  width: 26px; height: 26px;
  border: 3px solid rgba(255,215,0,.3);
  border-top-color: #FFD700;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ FOOTER ══ */
.footer {
  text-align: center;
  padding: 0 20px 40px;
  font-size: 13px;
  color: #9CA3AF;
  line-height: 1.6;
}
.footer b { color: #6B7280; font-weight: 700; }
</style>
</head>
<body>

<!-- CABECERA -->
<div class="header">
  <div class="header-ico">🇨🇴 ⚽ 🇵🇹</div>
  <div class="header-badge">🏆 Copa Mundo 2026 · CEISCOL</div>
  <h1>Pre-Registro<span>Polla Mundialista</span></h1>
  <div class="header-match">🇨🇴 Colombia &nbsp;vs&nbsp; Portugal 🇵🇹</div>
</div>

<div class="content">

<!-- AVISO -->
<div class="notice">
  <div class="ico">📲</div>
  <p>Regístrate y <b>recibe el link exclusivo</b> para registrar tu marcador del partido.</p>
</div>

<form id="F" novalidate>

  <!-- SECCION 1: LABORATORIO -->
  <div class="section">
    <div class="section-header">
      <div class="sec-num">1</div>
      <div class="sec-title">🏥 Laboratorio / Cliente</div>
    </div>

    <div class="field">
      <label for="lab">Nombre del Laboratorio o Cliente <span class="req">*</span></label>
      <input id="lab" type="text" placeholder="Ej: Lab. Clínico San Rafael" autocomplete="organization"/>
    </div>

    <div class="field">
      <label for="dpto">Departamento <span class="req">*</span></label>
      <select id="dpto">
        <option value="">Selecciona tu departamento...</option>
      </select>
    </div>

    <div class="field">
      <label for="ciu">Ciudad / Municipio <span class="req">*</span></label>
      <select id="ciu" disabled>
        <option value="">Primero selecciona el departamento</option>
      </select>
    </div>
  </div>

  <!-- SECCION 2: PROFESION -->
  <div class="section">
    <div class="section-header">
      <div class="sec-num">2</div>
      <div class="sec-title">🔬 Tu Profesión</div>
    </div>
    <div class="pills-box" id="pw">
      <div class="pills-grid">
        <input class="pi" type="radio" name="prof" id="p1" value="Bacteriólogo/a"/>
        <label class="pl" for="p1">
          <span class="pi-ico">🔬</span>
          <span class="pi-txt">Bacteriólogo/a</span>
        </label>
        <input class="pi" type="radio" name="prof" id="p2" value="Auxiliar de Laboratorio"/>
        <label class="pl" for="p2">
          <span class="pi-ico">🧪</span>
          <span class="pi-txt">Auxiliar de Lab.</span>
        </label>
        <input class="pi" type="radio" name="prof" id="p3" value="Administrativo/a"/>
        <label class="pl" for="p3">
          <span class="pi-ico">💼</span>
          <span class="pi-txt">Administrativo/a</span>
        </label>
        <input class="pi" type="radio" name="prof" id="p4" value="Otro"/>
        <label class="pl" for="p4">
          <span class="pi-ico">👤</span>
          <span class="pi-txt">Otro</span>
        </label>
      </div>
      <div class="pills-err">⚠️ Por favor selecciona tu profesión</div>
    </div>
  </div>

  <!-- SECCION 3: DATOS PERSONALES -->
  <div class="section">
    <div class="section-header">
      <div class="sec-num">3</div>
      <div class="sec-title">👤 Datos Personales</div>
    </div>

    <div class="field">
      <label for="nom">Nombres <span class="req">*</span></label>
      <input id="nom" type="text" placeholder="Escribe tus nombres" autocomplete="given-name"/>
    </div>

    <div class="field">
      <label for="ape">Apellidos <span class="req">*</span></label>
      <input id="ape" type="text" placeholder="Escribe tus apellidos" autocomplete="family-name"/>
    </div>

    <div class="field">
      <label for="tdoc">Tipo de Documento <span class="req">*</span></label>
      <select id="tdoc">
        <option value="">Selecciona el tipo...</option>
        <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
        <option value="Cédula de Extranjería">Cédula de Extranjería</option>
        <option value="Pasaporte">Pasaporte</option>
        <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
      </select>
    </div>

    <div class="field">
      <label for="ndoc">Número de Documento <span class="req">*</span></label>
      <input id="ndoc" type="text" placeholder="Ej: 1020304050" inputmode="numeric"/>
    </div>

    <div class="field">
      <label for="cel">📱 Número de Celular <span class="req">*</span></label>
      <input id="cel" type="tel" placeholder="Ej: 3001234567" inputmode="tel" autocomplete="tel"/>
    </div>

    <!-- FECHA DE NACIMIENTO: 3 campos en columna, sin overflow -->
    <div class="field">
      <label for="dd">🎂 Día de Nacimiento <span class="req">*</span></label>
      <select id="dd">
        <option value="">Selecciona el día...</option>
      </select>
    </div>

    <div class="field">
      <label for="dm">🗓️ Mes de Nacimiento <span class="req">*</span></label>
      <select id="dm">
        <option value="">Selecciona el mes...</option>
        <option value="01">Enero</option>
        <option value="02">Febrero</option>
        <option value="03">Marzo</option>
        <option value="04">Abril</option>
        <option value="05">Mayo</option>
        <option value="06">Junio</option>
        <option value="07">Julio</option>
        <option value="08">Agosto</option>
        <option value="09">Septiembre</option>
        <option value="10">Octubre</option>
        <option value="11">Noviembre</option>
        <option value="12">Diciembre</option>
      </select>
    </div>

    <div class="field">
      <label for="dy">📅 Año de Nacimiento <span class="req">*</span></label>
      <select id="dy">
        <option value="">Selecciona el año...</option>
      </select>
    </div>

    <div class="field">
      <label for="mail">✉️ Correo Electrónico Personal <span class="req">*</span></label>
      <input id="mail" type="email" placeholder="tu@correo.com" inputmode="email" autocomplete="email"/>
    </div>

    <div class="field">
      <label for="mail2">Confirmar Correo Electrónico <span class="req">*</span></label>
      <input id="mail2" type="email" placeholder="Repite tu correo" autocomplete="off"/>
    </div>
  </div>

  <!-- TERMINOS -->
  <div class="terms-card">
    <input type="checkbox" id="trm"/>
    <p>Autorizo el uso de mis datos personales para la <strong>Polla Mundialista CEISCOL 2026</strong>, conforme a la Ley 1581 de 2012 de protección de datos personales.</p>
  </div>

  <!-- ALERTAS -->
  <div class="alert alert-ok" id="aok">
    ✅ <strong>¡Registro exitoso!</strong> Revisa tu correo — pronto recibirás el link. ¡Vamos Colombia! 🇨🇴
  </div>
  <div class="alert alert-er" id="aer"></div>

  <!-- BOTON -->
  <div class="btn-area">
    <button type="submit" class="btn" id="btn">
      <span id="btxt">⚽ REGISTRARME AHORA</span>
      <div class="spinner" id="spin"></div>
    </button>
  </div>

</form>

<div class="footer">
  <b>CEISCOL</b> · Polla Mundialista 2026<br>
  🇨🇴 Colombia vs Portugal 🇵🇹
</div>

</div><!-- /content -->

<script>
// ── DATOS COLOMBIA ──
var DPTS = {
  "Amazonas":["Leticia","Puerto Nariño"],
  "Antioquia":["Medellín","Bello","Itagüí","Envigado","Sabaneta","La Estrella","Caldas","Copacabana","Girardota","Rionegro","Apartadó","Turbo","Caucasia","Marinilla","El Carmen de Viboral"],
  "Arauca":["Arauca","Saravena","Tame","Fortul","Arauquita"],
  "Atlántico":["Barranquilla","Soledad","Malambo","Sabanalarga","Baranoa","Puerto Colombia","Galapa"],
  "Bogotá D.C.":["Bogotá D.C."],
  "Bolívar":["Cartagena","Magangué","El Carmen de Bolívar","Mompós","Turbaco","Arjona"],
  "Boyacá":["Tunja","Duitama","Sogamoso","Chiquinquirá","Paipa","Monguí","Villa de Leyva","Soatá"],
  "Caldas":["Manizales","Villamaría","Chinchiná","La Dorada","Riosucio","Palestina","Anserma"],
  "Caquetá":["Florencia","San Vicente del Caguán","Puerto Rico","Belén de los Andaquíes","Morelia"],
  "Casanare":["Yopal","Aguazul","Villanueva","Tauramena","Paz de Ariporo","Trinidad"],
  "Cauca":["Popayán","Santander de Quilichao","Puerto Tejada","Patía","El Bordo","Piendamó"],
  "Cesar":["Valledupar","Aguachica","Agustín Codazzi","La Paz","Chiriguaná","Bosconia"],
  "Chocó":["Quibdó","Istmina","Riosucio","Condoto","Bahía Solano","Bojayá"],
  "Córdoba":["Montería","Cereté","Sahagún","Lorica","Montelíbano","Tierralta","Ciénaga de Oro"],
  "Cundinamarca":["Soacha","Fusagasugá","Facatativá","Zipaquirá","Chía","Mosquera","Madrid","Girardot","Cajicá","Tocancipá","Funza","La Calera","Sibaté","Sopó","Tabio","Tenjo"],
  "Guainía":["Inírida"],
  "Guaviare":["San José del Guaviare","El Retorno","Calamar","Miraflores"],
  "Huila":["Neiva","Pitalito","Garzón","La Plata","Campoalegre","Rivera"],
  "La Guajira":["Riohacha","Maicao","Uribia","Manaure","San Juan del Cesar","Albania"],
  "Magdalena":["Santa Marta","Ciénaga","Fundación","El Banco","Aracataca","Plato"],
  "Meta":["Villavicencio","Acacías","Granada","Puerto López","Puerto Gaitán","Cumaral"],
  "Nariño":["Pasto","Tumaco","Ipiales","Túquerres","La Unión","Samaniego"],
  "Norte de Santander":["Cúcuta","Ocaña","Pamplona","Villa del Rosario","Los Patios","El Zulia","Tibú"],
  "Putumayo":["Mocoa","Puerto Asís","Orito","Valle del Guamuez","Sibundoy","San Francisco"],
  "Quindío":["Armenia","Calarcá","Montenegro","Quimbaya","Circasia","La Tebaida"],
  "Risaralda":["Pereira","Dosquebradas","Santa Rosa de Cabal","La Virginia","Marsella","Quinchía"],
  "San Andrés y Providencia":["San Andrés","Providencia"],
  "Santander":["Bucaramanga","Floridablanca","Girón","Piedecuesta","Barrancabermeja","San Gil","Socorro","Vélez"],
  "Sucre":["Sincelejo","Corozal","San Marcos","Sampués","Tolú","Morroa"],
  "Tolima":["Ibagué","Espinal","Honda","Melgar","Chaparral","Líbano","Mariquita"],
  "Valle del Cauca":["Cali","Buenaventura","Palmira","Tuluá","Buga","Cartago","Yumbo","Jamundí","Candelaria","Dagua","Pradera","Florida"],
  "Vaupés":["Mitú"],
  "Vichada":["Puerto Carreño","La Primavera"]
};

(function(){
  var sd = document.getElementById('dpto');
  Object.keys(DPTS).sort().forEach(function(d){
    var o = document.createElement('option');
    o.value = o.textContent = d;
    sd.appendChild(o);
  });
  var dd = document.getElementById('dd');
  for(var i=1; i<=31; i++){
    var o = document.createElement('option');
    o.value = o.textContent = (i<10?'0':'')+i;
    dd.appendChild(o);
  }
  var dy = document.getElementById('dy');
  var yr = new Date().getFullYear();
  for(var j=yr-16; j>=yr-85; j--){
    var o2 = document.createElement('option');
    o2.value = o2.textContent = j;
    dy.appendChild(o2);
  }
})();

document.getElementById('dpto').addEventListener('change', function(){
  var dval = this.value;
  var sel = document.getElementById('ciu');
  sel.innerHTML = '';
  if(!dval){
    sel.innerHTML = '<option value="">Primero selecciona el departamento</option>';
    sel.disabled = true;
    return;
  }
  var arr = DPTS[dval] || [];
  var def = document.createElement('option');
  def.value = ''; def.textContent = 'Selecciona tu ciudad...';
  sel.appendChild(def);
  arr.forEach(function(c){
    var o = document.createElement('option');
    o.value = o.textContent = c;
    sel.appendChild(o);
  });
  sel.disabled = false;
  this.classList.remove('err');
  setTimeout(function(){ sel.focus(); }, 150);
});

// Content-Type: text/plain evita el preflight CORS OPTIONS que GAS no soporta
document.getElementById('F').addEventListener('submit', function(e){
  e.preventDefault();
  ocultar();

  var lab  = g('lab'),  dpto = g('dpto'), ciu  = g('ciu');
  var nom  = g('nom'),  ape  = g('ape');
  var tdoc = g('tdoc'), ndoc = g('ndoc'), cel  = g('cel');
  var mail = g('mail'), m2   = g('mail2');
  var dd   = g('dd'),   dm   = g('dm'),   dy   = g('dy');
  var prof = '';
  document.querySelectorAll('input[name=prof]').forEach(function(r){ if(r.checked) prof = r.value; });

  var ok = true;
  ['lab','dpto','ciu','nom','ape','tdoc','ndoc','cel','mail','mail2','dd','dm','dy'].forEach(function(id){
    if(!g(id)){ mark(id); ok = false; }
  });
  if(!prof){ document.getElementById('pw').classList.add('err'); ok = false; }

  if(!ok)                              return err('Por favor completa todos los campos obligatorios.');
  if(!mail.includes('@'))              return err('El correo electrónico no es válido.');
  if(mail !== m2)                      return err('Los correos no coinciden. Verifícalos.');
  if(cel.replace(/\D/g,'').length < 7) return err('El número de celular no es válido.');
  if(!document.getElementById('trm').checked) return err('Debes aceptar la autorización de datos personales.');

  busy(true);

  var payload = JSON.stringify({
    laboratorio: lab, ciudad: ciu,  dpto:      dpto,
    nombres:     nom, apellidos: ape, profesion: prof,
    tipo_doc:    tdoc, num_doc:  ndoc, celular:  cel,
    email:       mail, fecha_nac: dy + '-' + dm + '-' + dd
  });

  fetch(window.location.href, {
    method:   'POST',
    redirect: 'follow',
    headers:  { 'Content-Type': 'text/plain;charset=UTF-8' },
    body:     payload
  })
  .then(function(r){
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function(r){
    if(r.ok){
      document.getElementById('aok').style.display = 'block';
      document.getElementById('F').reset();
      document.getElementById('ciu').disabled = true;
      document.getElementById('ciu').innerHTML = '<option value="">Primero selecciona el departamento</option>';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      err('Error del servidor: ' + (r.msg || 'intenta de nuevo.'));
    }
  })
  .catch(function(e){
    err('No se pudo enviar el formulario. Verifica tu conexión e intenta de nuevo. (' + e.message + ')');
  })
  .finally(function(){ busy(false); });
});

document.querySelectorAll('input, select').forEach(function(el){
  ['input','change'].forEach(function(ev){
    el.addEventListener(ev, function(){ el.classList.remove('err'); });
  });
});
document.querySelectorAll('input[name=prof]').forEach(function(r){
  r.addEventListener('change', function(){ document.getElementById('pw').classList.remove('err'); });
});

function g(id)  { return document.getElementById(id).value.trim(); }
function mark(id){ document.getElementById(id).classList.add('err'); }
function ocultar(){
  document.getElementById('aok').style.display = 'none';
  document.getElementById('aer').style.display = 'none';
}
function err(msg){
  var el = document.getElementById('aer');
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function busy(on){
  document.getElementById('btn').disabled = on;
  document.getElementById('btxt').style.display = on ? 'none' : 'inline';
  document.getElementById('spin').style.display  = on ? 'block' : 'none';
}
</script>

</body>
</html>`;
