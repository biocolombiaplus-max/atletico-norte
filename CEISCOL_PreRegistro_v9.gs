var REMITENTE_NOMBRE = 'CEISCOL Polla Mundialista 2026';
var EMAIL_CEISCOL    = 'ceiscol.concursos@gmail.com';
var NOMBRE_HOJA      = 'Polla Mundialista CEISCOL 2026';

// ── Menú en el Google Sheet ──────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚽ CEISCOL Polla')
    .addItem('📧 Enviar link a participantes SELECCIONADOS', 'enviarLinkSeleccionados')
    .addItem('📨 Enviar link a TODOS los pendientes', 'enviarLinkTodos')
    .addSeparator()
    .addItem('📊 Actualizar Dashboard', 'actualizarDashboard')
    .addItem('ℹ️ Instrucciones', 'mostrarInstrucciones')
    .addToUi();
}

function mostrarInstrucciones() {
  SpreadsheetApp.getUi().alert(
    '⚽ INSTRUCCIONES — Polla Mundialista CEISCOL 2026\n\n' +
    '1. Selecciona las filas de participantes a quienes enviar el link\n' +
    '2. Ve al menú ⚽ CEISCOL Polla → Enviar link a participantes SELECCIONADOS\n' +
    '3. Pega el link del formulario de marcador cuando se te solicite\n' +
    '4. El correo se enviará y el estado cambiará a "Link Enviado"\n\n' +
    '📌 Columna P = Estado del link (Pendiente / Link Enviado / Confirmado / No responde)'
  );
}

function enviarLinkSeleccionados() {
  var ui   = SpreadsheetApp.getUi();
  var resp = ui.prompt('🔗 Link del formulario de marcador',
    'Pega aquí el link que recibirán los participantes:', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var link = resp.getResponseText().trim();
  if (!link) { ui.alert('⚠️ No ingresaste ningún link.'); return; }

  var ss  = obtenerOCrearSheet();
  var h   = ss.getSheetByName('Registros');
  var sel = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange();
  var rows = sel.getValues(), startRow = sel.getRow();
  var enviados = 0, errores = 0;

  rows.forEach(function(row, i) {
    var fila = startRow + i;
    if (fila < 3) return;
    var nombre = (row[6] || '') + ' ' + (row[7] || '');
    var correo = row[12] || '';
    var estado = row[15] || '';
    if (!correo || estado === 'Link Enviado' || estado === 'Confirmado') return;
    try {
      enviarLinkEmail(nombre.trim(), correo, link);
      h.getRange(fila, 16).setValue('Link Enviado');
      enviados++;
    } catch(e) { errores++; Logger.log('Error: ' + correo + ' — ' + e); }
  });

  registrarEnvioMasivo(ss, enviados, 'Link Marcador');
  ui.alert('✅ Listo!\n\n' + enviados + ' correos enviados\n' + errores + ' errores');
}

function enviarLinkTodos() {
  var ui   = SpreadsheetApp.getUi();
  var resp = ui.prompt('🔗 Link del formulario de marcador',
    'Pega aquí el link para TODOS los pendientes:', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var link = resp.getResponseText().trim();
  if (!link) { ui.alert('⚠️ No ingresaste ningún link.'); return; }

  var ss   = obtenerOCrearSheet();
  var h    = ss.getSheetByName('Registros');
  var data = h.getDataRange().getValues();
  var enviados = 0, errores = 0;

  for (var i = 2; i < data.length; i++) {
    var row = data[i];
    var nombre = (row[6] || '') + ' ' + (row[7] || '');
    var correo = row[12] || '', estado = row[15] || '';
    if (!correo || estado === 'Link Enviado' || estado === 'Confirmado') continue;
    try {
      enviarLinkEmail(nombre.trim(), correo, link);
      h.getRange(i + 1, 16).setValue('Link Enviado');
      enviados++;
    } catch(e) { errores++; }
  }

  registrarEnvioMasivo(ss, enviados, 'Link Marcador - Masivo');
  ui.alert('✅ Listo!\n\n' + enviados + ' correos enviados\n' + errores + ' errores');
}

function actualizarDashboard() {
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Dashboard').getRange('C9')
    .setFormula('=TEXT(NOW(),"DD/MM/YYYY HH:MM")');
  SpreadsheetApp.getUi().alert('✅ Dashboard actualizado.');
}

function registrarEnvioMasivo(ss, cantidad, tipo) {
  var h   = ss.getSheetByName('Mensajes');
  var now = new Date();
  var msgN = Math.max(h.getLastRow() - 1, 0) + 1;
  h.appendRow([msgN,
    Utilities.formatDate(now,'America/Bogota','dd/MM/yyyy'),
    Utilities.formatDate(now,'America/Bogota','HH:mm:ss'),
    'ENVÍO MASIVO','('+cantidad+' destinatarios)', tipo,
    'Envío masivo — Polla CEISCOL 2026','✅ Enviado', cantidad]);
}

// ── doGet ────────────────────────────────────────────────────────
function doGet() {
  var url  = ScriptApp.getService().getUrl();
  var html = HTML_FORM.replace('%%SCRIPT_URL%%', url);
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Pre-Registro — Polla Mundialista CEISCOL 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── doPost ───────────────────────────────────────────────────────
function doPost(e) {
  try {
    var d   = JSON.parse(e.postData.contents);
    var ss  = obtenerOCrearSheet();
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

// ── Sheet ────────────────────────────────────────────────────────
function obtenerOCrearSheet() {
  var files = DriveApp.getFilesByName(NOMBRE_HOJA);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(NOMBRE_HOJA);
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
    .setValue('⚽  POLLA MUNDIALISTA CEISCOL 2026  •  PRE-REGISTROS  •  PREMIO: $1.000.000 EN EFECTIVO 🏆')
    .setBackground('#CE1126').setFontColor('#FFD700').setFontWeight('bold').setFontSize(13)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  var H = ['#','Fecha','Hora','Cliente / Laboratorio','Ciudad','Dpto','Nombres','Apellidos',
           'Profesión','Tipo Doc','N° Doc','Celular','Correo','Fecha Nacimiento','Edad','Estado Link'];
  h.setRowHeight(2, 34);
  h.getRange(2,1,1,H.length).setValues([H])
    .setBackground('#003087').setFontColor('#FFD700')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');

  [45,85,65,230,120,120,140,140,160,110,110,110,210,120,55,120]
    .forEach(function(w,i){ h.setColumnWidth(i+1, w); });
  h.setFrozenRows(2);

  h.getRange(3,16,1000,1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pendiente','Link Enviado','Confirmado','No responde']).build()
  );

  // ── CORRECCIÓN: SpreadsheetApp.newConditionalFormatRule() ──────
  var rng = h.getRange(3,16,1000,1);
  h.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Pendiente')
      .setBackground('#FFF3CD').setFontColor('#856404').setRanges([rng]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Link Enviado')
      .setBackground('#D1ECF1').setFontColor('#0C5460').setRanges([rng]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Confirmado')
      .setBackground('#D4EDDA').setFontColor('#155724').setRanges([rng]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('No responde')
      .setBackground('#F8D7DA').setFontColor('#721C24').setRanges([rng]).build()
  ]);
}

function crearHojaMensajes(ss) {
  var h = ss.insertSheet('Mensajes');
  var H = ['#','Fecha','Hora','Destinatario','Correo','Tipo','Asunto','Estado','# Reg'];
  h.setRowHeight(1, 44);
  h.getRange(1,1,1,H.length).merge()
    .setValue('📨  SEGUIMIENTO DE MENSAJES — CEISCOL 2026')
    .setBackground('#003087').setFontColor('#FFD700').setFontWeight('bold').setFontSize(12)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  h.setRowHeight(2, 32);
  h.getRange(2,1,1,H.length).setValues([H])
    .setBackground('#FFD700').setFontColor('#003087')
    .setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  [45,85,65,170,210,160,280,110,60].forEach(function(w,i){ h.setColumnWidth(i+1,w); });
  h.setFrozenRows(2);
  h.getRange(3,8,1000,1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['✅ Enviado','❌ Error','⏳ Pendiente']).build()
  );
}

function crearHojaDashboard(ss) {
  var h = ss.insertSheet('Dashboard');
  h.setRowHeight(1, 52);
  h.getRange(1,1,1,5).merge()
    .setValue('🏆  DASHBOARD — POLLA MUNDIALISTA CEISCOL 2026 — PREMIO $1.000.000')
    .setBackground('#CE1126').setFontColor('#FFD700').setFontWeight('bold').setFontSize(15)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  var rows = [
    ['TOTAL REGISTROS',    '=COUNTA(Registros!G3:G)',                       '#003087'],
    ['LINKS ENVIADOS',     '=COUNTIF(Registros!P3:P,"Link Enviado")',        '#0077B6'],
    ['CONFIRMADOS',        '=COUNTIF(Registros!P3:P,"Confirmado")',          '#28A745'],
    ['PENDIENTES',         '=COUNTIF(Registros!P3:P,"Pendiente")',           '#E67E22'],
    ['MENSAJES ENVIADOS',  '=COUNTA(Mensajes!E3:E)',                         '#6F42C1'],
    ['EDAD PROMEDIO',      '=IFERROR(ROUND(AVERAGE(Registros!O3:O),1),"—")', '#555555'],
    ['ACTUALIZACIÓN',      '=TEXT(NOW(),"DD/MM/YYYY HH:MM")',                '#333333']
  ];
  rows.forEach(function(r,i){
    var f = i + 3; h.setRowHeight(f, 58);
    h.getRange(f,2).setValue(r[0]).setBackground(r[2]).setFontColor('#fff')
      .setFontWeight('bold').setFontSize(11).setHorizontalAlignment('center').setVerticalAlignment('middle');
    h.getRange(f,3).setFormula(r[1]).setBackground('#F8F9FF').setFontColor(r[2])
      .setFontWeight('bold').setFontSize(24).setHorizontalAlignment('center').setVerticalAlignment('middle');
  });
  h.setColumnWidth(1,20); h.setColumnWidth(2,220); h.setColumnWidth(3,140);
}

function guardarRegistro(ss, d) {
  var h     = ss.getSheetByName('Registros');
  var lastR = Math.max(h.getLastRow(), 2);
  var num   = lastR - 1;
  var ahora = new Date();
  var newR  = lastR + 1;
  var fnac  = d.fecha_nac ? new Date(d.fecha_nac + 'T00:00:00') : '';

  h.appendRow([num,
    Utilities.formatDate(ahora,'America/Bogota','dd/MM/yyyy'),
    Utilities.formatDate(ahora,'America/Bogota','HH:mm:ss'),
    d.laboratorio, d.ciudad, d.dpto, d.nombres, d.apellidos,
    d.profesion, d.tipo_doc, d.num_doc, d.celular, d.email,
    fnac || '', '', 'Pendiente']);

  if (fnac) {
    h.getRange(newR,14).setNumberFormat('dd/mm/yyyy');
    h.getRange(newR,15)
      .setFormula('=IF(N'+newR+'<>"",DATEDIF(N'+newR+',TODAY(),"Y"),"")')
      .setHorizontalAlignment('center').setFontWeight('bold').setFontColor('#003087');
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
  var msgN = Math.max(h.getLastRow() - 1, 0) + 1;
  var now  = new Date();
  h.appendRow([msgN,
    Utilities.formatDate(now,'America/Bogota','dd/MM/yyyy'),
    Utilities.formatDate(now,'America/Bogota','HH:mm:ss'),
    d.nombres+' '+d.apellidos, d.email,
    'Confirmación Pre-registro', 'Pre-registro Polla CEISCOL 2026', '✅ Enviado', num]);
  var fil = h.getLastRow();
  h.getRange(fil,1,1,9).setBackground(msgN%2===0?'#F0F4FF':'#FFFFFF').setFontSize(10).setVerticalAlignment('middle');
  h.setRowHeight(fil, 24);
}

// ── Emails ───────────────────────────────────────────────────────
function btnIG() {
  return '<div style="text-align:center;padding:10px 0 4px;">'
    +'<a href="https://www.instagram.com/ceiscol" target="_blank" '
    +'style="display:inline-block;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);'
    +'color:#fff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:50px;text-decoration:none;">'
    +'📸 Seguir @ceiscol en Instagram</a></div>';
}

function enviarConfirmacion(d) {
  var nombre = d.nombres + ' ' + d.apellidos;
  var fnacFmt = '';
  if (d.fecha_nac) { var p = d.fecha_nac.split('-'); fnacFmt = p[2]+'/'+p[1]+'/'+p[0]; }

  var html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>'
    +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#EAECF0;}'
    +'.wrap{max-width:600px;margin:24px auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.18);background:#fff;}'
    +'</style></head><body>'
    +'<div class="wrap">'
    // Barra tricolor
    +'<div style="height:8px;display:flex;">'
    +'<div style="flex:1;background:#FFD700"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#CE1126"></div>'
    +'</div>'
    // Hero
    +'<div style="background:linear-gradient(145deg,#001233 0%,#003087 55%,#7A0018 100%);padding:40px 28px 32px;text-align:center;">'
    +'<div style="font-size:60px;line-height:1;">⚽</div>'
    +'<h1 style="color:#FFD700;font-size:26px;font-weight:900;margin:12px 0 6px;">¡Registro exitoso!</h1>'
    +'<p style="color:rgba(255,255,255,.75);font-size:14px;">Polla Mundialista CEISCOL 2026</p>'
    +'</div>'
    // Premio
    +'<div style="background:linear-gradient(135deg,#FFD700,#FFC200);padding:24px 28px;text-align:center;">'
    +'<p style="font-size:11px;font-weight:800;letter-spacing:3px;color:#7A0018;text-transform:uppercase;">🏆 Premio en efectivo</p>'
    +'<p style="font-size:48px;font-weight:900;color:#003087;line-height:1.05;margin:6px 0;">$1.000.000</p>'
    +'<p style="font-size:14px;font-weight:700;color:#001233;">Acierta el marcador exacto 🇨🇴 vs 🇵🇹</p>'
    +'</div>'
    // Cuerpo
    +'<div style="padding:30px 28px;">'
    +'<p style="font-size:16px;color:#111;">Hola, <b style="color:#003087;">'+nombre+'</b> 👋</p>'
    +'<p style="font-size:14px;color:#555;line-height:1.75;margin-top:10px;">Tu inscripción fue registrada con éxito. Pronto recibirás el <b>link exclusivo</b> para ingresar tu marcador y participar.</p>'
    // Requisitos
    +'<div style="background:#F0F4FF;border-left:5px solid #003087;border-radius:0 12px 12px 0;padding:18px 20px;margin:22px 0;">'
    +'<p style="font-size:14px;font-weight:800;color:#003087;margin-bottom:10px;">📋 Requisitos para ganar:</p>'
    +'<p style="font-size:14px;color:#374151;line-height:1.9;">'
    +'✅ Ser colaborador de un cliente CEISCOL<br>'
    +'✅ Seguir <b>@ceiscol</b> en Instagram<br>'
    +'✅ Acertar el marcador exacto del partido</p>'
    +'</div>'
    // Instagram
    +'<p style="font-size:13px;color:#555;text-align:center;margin-bottom:4px;">⚠️ <b>Requisito obligatorio:</b> debes seguirnos</p>'
    +btnIG()
    // Tabla datos
    +'<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:24px;border-radius:10px;overflow:hidden;">'
    +'<tr><th colspan="2" style="background:#003087;color:#FFD700;padding:11px 14px;text-align:left;font-size:13px;">📋 Tus datos registrados</th></tr>'
    +'<tr style="background:#F8F9FF;"><td style="padding:10px 14px;color:#888;width:38%;">🏥 Laboratorio</td><td style="padding:10px 14px;font-weight:700;color:#003087;">'+d.laboratorio+'</td></tr>'
    +'<tr><td style="padding:10px 14px;color:#888;">📍 Ciudad</td><td style="padding:10px 14px;">'+d.ciudad+' — '+d.dpto+'</td></tr>'
    +'<tr style="background:#F8F9FF;"><td style="padding:10px 14px;color:#888;">👤 Nombre</td><td style="padding:10px 14px;font-weight:600;">'+nombre+'</td></tr>'
    +'<tr><td style="padding:10px 14px;color:#888;">🔬 Profesión</td><td style="padding:10px 14px;">'+d.profesion+'</td></tr>'
    +(fnacFmt?'<tr style="background:#F8F9FF;"><td style="padding:10px 14px;color:#888;">🎂 Nacimiento</td><td style="padding:10px 14px;">'+fnacFmt+'</td></tr>':'')
    +'</table>'
    +'<p style="font-size:12px;color:#CBD5E1;margin-top:28px;text-align:center;">¡Vamos Colombia! 💛💙❤️ • CEISCOL 2026</p>'
    +'</div>'
    +'<div style="height:8px;display:flex;">'
    +'<div style="flex:1;background:#CE1126"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#FFD700"></div>'
    +'</div>'
    +'</div></body></html>';

  MailApp.sendEmail({
    to: d.email,
    subject: '⚽ ¡Inscripción exitosa! Gana $1.000.000 — Polla Mundialista CEISCOL 2026',
    htmlBody: html,
    name: REMITENTE_NOMBRE
  });

  MailApp.sendEmail({
    to: EMAIL_CEISCOL,
    subject: '🔔 Nuevo pre-registro: ' + nombre + ' | ' + d.laboratorio,
    htmlBody: '<div style="font-family:Arial;max-width:560px;padding:20px;">'
      +'<h2 style="color:#003087;">⚽ Nuevo pre-registro — CEISCOL 2026</h2>'
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

function enviarLinkEmail(nombre, correo, link) {
  var html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>'
    +'<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#EAECF0;}'
    +'.wrap{max-width:600px;margin:24px auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.18);background:#fff;}'
    +'</style></head><body>'
    +'<div class="wrap">'
    +'<div style="height:8px;display:flex;"><div style="flex:1;background:#FFD700"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#CE1126"></div></div>'
    +'<div style="background:linear-gradient(145deg,#001233 0%,#003087 55%,#7A0018 100%);padding:40px 28px 32px;text-align:center;">'
    +'<div style="font-size:60px;">⚽</div>'
    +'<h1 style="color:#FFD700;font-size:26px;font-weight:900;margin:12px 0 6px;">¡Llegó tu link!</h1>'
    +'<p style="color:rgba(255,255,255,.75);font-size:14px;">Polla Mundialista CEISCOL 2026</p>'
    +'</div>'
    +'<div style="background:linear-gradient(135deg,#FFD700,#FFC200);padding:18px 28px;text-align:center;">'
    +'<p style="font-size:13px;font-weight:800;color:#003087;letter-spacing:1px;">🏆 PREMIO: $1.000.000 EN EFECTIVO</p>'
    +'</div>'
    +'<div style="padding:30px 28px;">'
    +'<p style="font-size:16px;color:#111;">Hola, <b style="color:#003087;">'+nombre+'</b> 👋</p>'
    +'<p style="font-size:14px;color:#555;line-height:1.75;margin-top:10px;">¡Llegó tu momento! Ingresa tu marcador para Colombia vs Portugal 🇨🇴🆚🇵🇹</p>'
    +'<div style="text-align:center;margin:28px 0;">'
    +'<a href="'+link+'" style="display:inline-block;background:linear-gradient(110deg,#002566,#003087,#0047D4);color:#FFD700;font-size:16px;font-weight:900;padding:18px 40px;border-radius:14px;text-decoration:none;letter-spacing:1px;">⚽ INGRESAR MI MARCADOR</a>'
    +'</div>'
    +'<p style="font-size:13px;color:#888;text-align:center;margin-bottom:16px;">⏰ Regístralo antes del inicio del partido</p>'
    +'<div style="background:#F0F4FF;border-left:5px solid #003087;border-radius:0 12px 12px 0;padding:16px 18px;margin-bottom:16px;">'
    +'<p style="font-size:13px;color:#374151;line-height:1.9;">'
    +'✅ Ser colaborador de un cliente CEISCOL<br>✅ Seguir <b>@ceiscol</b> en Instagram<br>✅ Acertar el marcador exacto</p>'
    +'</div>'
    +btnIG()
    +'<p style="font-size:12px;color:#CBD5E1;margin-top:24px;text-align:center;">¡Vamos Colombia! 💛💙❤️ • CEISCOL 2026</p>'
    +'</div>'
    +'<div style="height:8px;display:flex;"><div style="flex:1;background:#CE1126"></div><div style="flex:1;background:#003087"></div><div style="flex:1;background:#FFD700"></div></div>'
    +'</div></body></html>';

  MailApp.sendEmail({
    to: correo,
    subject: '⚽ Tu link para el marcador — Polla Mundialista CEISCOL 2026',
    htmlBody: html,
    name: REMITENTE_NOMBRE
  });
}

// ════════════════════════════════════════════════════════════════
// HTML FORM
// ════════════════════════════════════════════════════════════════
var HTML_FORM = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<title>Pre-Registro · Polla Mundialista CEISCOL 2026</title>
<style>
/* ════ RESET ════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background: #0F172A;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* ════ CABECERA ════ */
.hdr {
  background: linear-gradient(160deg, #0A1628 0%, #003087 55%, #6B0017 100%);
  padding: 48px 20px 64px;
  text-align: center;
  position: relative;
  overflow: hidden;
  width: 100%;
}
.hdr::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(255,215,0,.15), transparent 70%);
  border-radius: 50%;
}
.hdr::after {
  content: '';
  position: absolute;
  bottom: -30px; left: -30px;
  width: 140px; height: 140px;
  background: radial-gradient(circle, rgba(206,17,38,.2), transparent 70%);
  border-radius: 50%;
}
.hdr-flags { font-size: 40px; letter-spacing: 4px; margin-bottom: 14px; }
.hdr-chip {
  display: inline-block;
  background: rgba(255,215,0,.15);
  border: 1px solid rgba(255,215,0,.4);
  color: #FFD700;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 6px 18px;
  border-radius: 100px;
  margin-bottom: 16px;
}
.hdr h1 {
  font-size: 30px;
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.hdr h1 em { color: #FFD700; font-style: normal; display: block; }
.hdr-vs {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 100px;
  padding: 10px 24px;
  color: rgba(255,255,255,.92);
  font-size: 16px;
  font-weight: 700;
}

/* ════ CONTENEDOR ════ */
.page {
  padding: 0 0 80px;
  width: 100%;
}

/* ════ TARJETA PREMIO ════ */
.prize-card {
  margin: -32px 16px 0;
  position: relative;
  z-index: 30;
  background: linear-gradient(145deg, #FFD700 0%, #FFBA00 100%);
  border-radius: 24px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.2) inset;
  width: calc(100% - 32px);
}
.prize-eyebrow {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(122,0,24,.7);
  margin-bottom: 6px;
}
.prize-trophy { font-size: 32px; line-height: 1; margin-bottom: 6px; }
.prize-amount {
  font-size: 52px;
  font-weight: 900;
  color: #003087;
  line-height: 1;
  letter-spacing: -1px;
  margin-bottom: 4px;
}
.prize-sub {
  font-size: 14px;
  font-weight: 700;
  color: #001B4E;
  margin-bottom: 14px;
}
.prize-pills {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0,48,135,.1);
  border-radius: 14px;
  padding: 12px 16px;
  text-align: left;
}
.prize-pill {
  font-size: 13px;
  font-weight: 700;
  color: #001B4E;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ════ BOTÓN IG ════ */
.ig-wrap {
  margin: 14px 16px 0;
  width: calc(100% - 32px);
}
.ig-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f09433, #e6683c 30%, #dc2743 55%, #cc2366 80%, #bc1888);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  font-family: inherit;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(188,24,136,.35);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* ════ CHIP AVISO ════ */
.aviso {
  margin: 14px 16px 0;
  width: calc(100% - 32px);
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  gap: 14px;
  align-items: center;
}
.aviso-ico { font-size: 28px; flex-shrink: 0; }
.aviso p { font-size: 14px; color: rgba(255,255,255,.8); line-height: 1.55; font-weight: 500; }
.aviso b { color: #FFD700; }

/* ════ SECCIÓN ════ */
.sec {
  margin: 14px 16px 0;
  width: calc(100% - 32px);
  background: #1E293B;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
}
.sec-hdr {
  padding: 18px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  display: flex;
  align-items: center;
  gap: 12px;
}
.sec-num {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #003087, #0047D4);
  color: #FFD700;
  font-size: 14px;
  font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,71,212,.4);
}
.sec-ttl { font-size: 17px; font-weight: 800; color: #F1F5F9; }

/* ════ CAMPO ════ */
.f {
  padding: 0 20px;
  border-bottom: 1px solid rgba(255,255,255,.06);
  width: 100%;
}
.f:last-child { border-bottom: none; }

.f label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #94A3B8;
  padding-top: 16px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: .5px;
  word-break: break-word;
  -webkit-user-select: none;
  user-select: none;
}
.f label .r { color: #EF4444; margin-left: 3px; }

/* ANTI-ZOOM iOS: font-size mínimo 16px + touch-action */
.f input,
.f select {
  display: block;
  width: 100%;
  max-width: 100%;
  height: 54px;
  padding: 0 16px;
  margin-bottom: 16px;
  background: #0F172A;
  border: 1.5px solid rgba(255,255,255,.1);
  border-radius: 14px;
  font-size: 16px;
  font-family: inherit;
  font-weight: 500;
  color: #F1F5F9;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  transition: border-color .15s, box-shadow .15s;
}
.f input::placeholder { color: #475569; font-weight: 400; }
.f input:focus,
.f select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59,130,246,.2);
}
.f input.err,
.f select.err {
  border-color: #EF4444 !important;
  box-shadow: 0 0 0 4px rgba(239,68,68,.2) !important;
}
.f select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%2394A3B8' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  background-color: #0F172A;
  padding-right: 44px;
  cursor: pointer;
  color: #F1F5F9;
}
.f select option { background: #1E293B; color: #F1F5F9; }
.f select:disabled { opacity: .35; cursor: not-allowed; }

/* ════ PASTILLAS PROFESIÓN ════ */
.pills { padding: 16px 20px 20px; }
.pgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pi { display: none; }
.pl {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 88px;
  padding: 16px 10px;
  background: #0F172A;
  border: 1.5px solid rgba(255,255,255,.1);
  border-radius: 16px;
  cursor: pointer;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  transition: border-color .13s, background .13s, box-shadow .13s;
}
.pl .e { font-size: 28px; line-height: 1; }
.pl .t { font-size: 13px; font-weight: 700; color: #64748B; line-height: 1.3; }
.pi:checked + .pl {
  background: rgba(59,130,246,.15);
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59,130,246,.2);
}
.pi:checked + .pl .t { color: #93C5FD; }
.perr { display: none; font-size: 13px; color: #EF4444; margin-top: 8px; }
.pills.err .perr { display: block; }
.pills.err .pl { border-color: rgba(239,68,68,.4); }

/* ════ TÉRMINOS ════ */
.terms {
  margin: 14px 16px 0;
  width: calc(100% - 32px);
  background: rgba(255,215,0,.07);
  border: 1.5px solid rgba(255,215,0,.25);
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.terms input[type=checkbox] {
  width: 26px; height: 26px; min-width: 26px;
  accent-color: #3B82F6;
  cursor: pointer;
  touch-action: manipulation;
  margin-top: 1px;
  flex-shrink: 0;
}
.terms p { font-size: 13px; color: rgba(255,255,255,.65); line-height: 1.7; word-break: break-word; }
.terms strong { color: #FFD700; }

/* ════ ALERTAS ════ */
.alert {
  margin: 14px 16px 0;
  width: calc(100% - 32px);
  border-radius: 16px;
  padding: 18px 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  display: none;
  word-break: break-word;
}
.aok { background: rgba(16,185,129,.15); border: 1.5px solid rgba(16,185,129,.4); color: #6EE7B7; }
.aer { background: rgba(239,68,68,.15); border: 1.5px solid rgba(239,68,68,.4); color: #FCA5A5; }

/* ════ BOTÓN SUBMIT ════ */
.btn-wrap { padding: 20px 16px 60px; width: 100%; }
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 62px;
  border: none;
  border-radius: 18px;
  font-size: 17px;
  font-weight: 900;
  font-family: inherit;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  background: linear-gradient(110deg, #FFD700 0%, #FFBA00 50%, #FFD700 100%);
  color: #001233;
  box-shadow: 0 12px 32px rgba(255,215,0,.35), 0 4px 12px rgba(0,0,0,.3);
  -webkit-appearance: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: opacity .15s, transform .1s;
  background-size: 200%;
  background-position: 0%;
}
.btn:active { opacity: .88; transform: scale(.985); }
.btn:disabled { opacity: .4; cursor: not-allowed; transform: none; }

.spin {
  display: none;
  width: 24px; height: 24px;
  border: 3px solid rgba(0,18,51,.2);
  border-top-color: #001233;
  border-radius: 50%;
  animation: rot .7s linear infinite;
  flex-shrink: 0;
}
@keyframes rot { to { transform: rotate(360deg); } }

/* ════ FOOTER ════ */
.foot {
  text-align: center;
  padding: 0 16px 40px;
  font-size: 12px;
  color: rgba(255,255,255,.3);
  line-height: 1.8;
}
.foot a { color: #bc1888; text-decoration: none; font-weight: 700; }
</style>
</head>
<body>

<!-- CABECERA -->
<div class="hdr">
  <div class="hdr-flags">🇨🇴 ⚽ 🇵🇹</div>
  <div class="hdr-chip">🏆 Copa Mundo 2026 · CEISCOL</div>
  <h1>Pre-Registro<em>Polla Mundialista</em></h1>
  <div class="hdr-vs">🇨🇴 Colombia &nbsp;vs&nbsp; Portugal 🇵🇹</div>
</div>

<div class="page">

<!-- TARJETA PREMIO -->
<div class="prize-card">
  <div class="prize-eyebrow">Premio en efectivo</div>
  <div class="prize-trophy">🏆</div>
  <div class="prize-amount">$1.000.000</div>
  <div class="prize-sub">Al que acierte el marcador exacto 🎯</div>
  <div class="prize-pills">
    <div class="prize-pill">✅ Ser colaborador de un cliente CEISCOL</div>
    <div class="prize-pill">✅ Seguir <strong>@ceiscol</strong> en Instagram</div>
    <div class="prize-pill">✅ Registrar el marcador antes del partido</div>
  </div>
</div>

<!-- INSTAGRAM -->
<div class="ig-wrap">
  <a class="ig-btn" href="https://www.instagram.com/ceiscol" target="_blank">
    📸 &nbsp;Seguir @ceiscol — requisito para ganar
  </a>
</div>

<!-- AVISO -->
<div class="aviso">
  <div class="aviso-ico">📲</div>
  <p>Regístrate y recibe el <b>link exclusivo</b> para ingresar tu marcador y ganar <b>$1.000.000</b>.</p>
</div>

<form id="F" novalidate>

<!-- SECCIÓN 1: LABORATORIO -->
<div class="sec">
  <div class="sec-hdr">
    <div class="sec-num">1</div>
    <div class="sec-ttl">🏥 Laboratorio / Cliente</div>
  </div>
  <div class="f">
    <label for="lab">Nombre del Laboratorio <span class="r">*</span></label>
    <input id="lab" type="text" placeholder="Ej: Lab. Clínico San Rafael" autocomplete="organization"/>
  </div>
  <div class="f">
    <label for="dpto">Departamento <span class="r">*</span></label>
    <select id="dpto"><option value="">— Selecciona tu departamento —</option></select>
  </div>
  <div class="f">
    <label for="ciu">Ciudad / Municipio <span class="r">*</span></label>
    <select id="ciu" disabled><option value="">Primero selecciona el departamento</option></select>
  </div>
</div>

<!-- SECCIÓN 2: PROFESIÓN -->
<div class="sec">
  <div class="sec-hdr">
    <div class="sec-num">2</div>
    <div class="sec-ttl">🔬 Tu Profesión</div>
  </div>
  <div class="pills" id="pw">
    <div class="pgrid">
      <input class="pi" type="radio" name="prof" id="p1" value="Bacteriólogo/a"/>
      <label class="pl" for="p1"><span class="e">🔬</span><span class="t">Bacteriólogo/a</span></label>

      <input class="pi" type="radio" name="prof" id="p2" value="Auxiliar de Laboratorio"/>
      <label class="pl" for="p2"><span class="e">🧪</span><span class="t">Auxiliar de Lab.</span></label>

      <input class="pi" type="radio" name="prof" id="p3" value="Administrativo/a"/>
      <label class="pl" for="p3"><span class="e">💼</span><span class="t">Administrativo/a</span></label>

      <input class="pi" type="radio" name="prof" id="p4" value="Otro"/>
      <label class="pl" for="p4"><span class="e">👤</span><span class="t">Otro</span></label>
    </div>
    <div class="perr">⚠️ Por favor selecciona tu profesión</div>
  </div>
</div>

<!-- SECCIÓN 3: DATOS PERSONALES -->
<div class="sec">
  <div class="sec-hdr">
    <div class="sec-num">3</div>
    <div class="sec-ttl">👤 Datos Personales</div>
  </div>

  <div class="f">
    <label for="nom">Nombres <span class="r">*</span></label>
    <input id="nom" type="text" placeholder="Escribe tus nombres" autocomplete="given-name"/>
  </div>
  <div class="f">
    <label for="ape">Apellidos <span class="r">*</span></label>
    <input id="ape" type="text" placeholder="Escribe tus apellidos" autocomplete="family-name"/>
  </div>
  <div class="f">
    <label for="tdoc">Tipo de Documento <span class="r">*</span></label>
    <select id="tdoc">
      <option value="">— Selecciona el tipo —</option>
      <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
      <option value="Cédula de Extranjería">Cédula de Extranjería</option>
      <option value="Pasaporte">Pasaporte</option>
      <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
    </select>
  </div>
  <div class="f">
    <label for="ndoc">Número de Documento <span class="r">*</span></label>
    <input id="ndoc" type="text" placeholder="Ej: 1020304050" inputmode="numeric"/>
  </div>
  <div class="f">
    <label for="cel">📱 Celular <span class="r">*</span></label>
    <input id="cel" type="tel" placeholder="Ej: 3001234567" inputmode="tel" autocomplete="tel"/>
  </div>

  <!-- FECHA NACIMIENTO — 3 campos apilados -->
  <div class="f">
    <label for="dd">🎂 Día de Nacimiento <span class="r">*</span></label>
    <select id="dd"><option value="">— Día —</option></select>
  </div>
  <div class="f">
    <label for="dm">🗓 Mes de Nacimiento <span class="r">*</span></label>
    <select id="dm">
      <option value="">— Mes —</option>
      <option value="01">Enero</option><option value="02">Febrero</option>
      <option value="03">Marzo</option><option value="04">Abril</option>
      <option value="05">Mayo</option><option value="06">Junio</option>
      <option value="07">Julio</option><option value="08">Agosto</option>
      <option value="09">Septiembre</option><option value="10">Octubre</option>
      <option value="11">Noviembre</option><option value="12">Diciembre</option>
    </select>
  </div>
  <div class="f">
    <label for="dy">📅 Año de Nacimiento <span class="r">*</span></label>
    <select id="dy"><option value="">— Año —</option></select>
  </div>

  <div class="f">
    <label for="mail">✉️ Correo Personal <span class="r">*</span></label>
    <input id="mail" type="email" placeholder="tu@correo.com" inputmode="email" autocomplete="email"/>
  </div>
  <div class="f">
    <label for="mail2">Confirmar Correo <span class="r">*</span></label>
    <input id="mail2" type="email" placeholder="Repite tu correo" autocomplete="off"/>
  </div>
</div>

<!-- TÉRMINOS -->
<div class="terms">
  <input type="checkbox" id="trm"/>
  <p>Autorizo el uso de mis datos, confirmo ser colaborador de un cliente CEISCOL y acepto seguir <strong>@ceiscol</strong> en Instagram como requisito para participar en la <strong>Polla Mundialista CEISCOL 2026</strong> (Ley 1581/2012).</p>
</div>

<!-- ALERTAS -->
<div class="alert aok" id="aok">
  ✅ <strong>¡Registro exitoso!</strong> Revisa tu correo — pronto recibirás el link para ingresar tu marcador. ¡Vamos Colombia! 🇨🇴
</div>
<div class="alert aer" id="aer"></div>

<!-- BOTÓN -->
<div class="btn-wrap">
  <button type="submit" class="btn" id="btn">
    <span id="btxt">⚽ &nbsp;REGISTRARME AHORA</span>
    <div class="spin" id="spin"></div>
  </button>
</div>

</form>

<!-- INSTAGRAM FINAL -->
<div class="ig-wrap" style="margin-bottom:18px;">
  <a class="ig-btn" href="https://www.instagram.com/ceiscol" target="_blank">
    📸 &nbsp;Seguir @ceiscol — ¡Requisito para ganar!
  </a>
</div>

<div class="foot">
  <strong style="color:rgba(255,255,255,.5);">CEISCOL</strong> · Polla Mundialista 2026<br>
  🇨🇴 Colombia vs Portugal 🇵🇹<br>
  <a href="https://www.instagram.com/ceiscol">@ceiscol</a>
</div>

</div><!-- /page -->

<script>
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

(function init(){
  // Departamentos
  var sd = document.getElementById('dpto');
  Object.keys(DPTS).sort().forEach(function(d){
    var o = document.createElement('option');
    o.value = o.textContent = d;
    sd.appendChild(o);
  });
  // Días
  var elDd = document.getElementById('dd');
  for (var i = 1; i <= 31; i++) {
    var o = document.createElement('option');
    o.value = o.textContent = (i < 10 ? '0' : '') + i;
    elDd.appendChild(o);
  }
  // Años
  var elDy = document.getElementById('dy');
  var yr = new Date().getFullYear();
  for (var j = yr - 16; j >= yr - 85; j--) {
    var o2 = document.createElement('option');
    o2.value = o2.textContent = j;
    elDy.appendChild(o2);
  }
})();

document.getElementById('dpto').addEventListener('change', function(){
  var sel = document.getElementById('ciu');
  sel.innerHTML = '';
  if (!this.value) {
    sel.innerHTML = '<option value="">Primero selecciona el departamento</option>';
    sel.disabled = true; return;
  }
  var def = document.createElement('option');
  def.value = ''; def.textContent = '— Selecciona tu ciudad —';
  sel.appendChild(def);
  (DPTS[this.value] || []).forEach(function(c){
    var o = document.createElement('option');
    o.value = o.textContent = c;
    sel.appendChild(o);
  });
  sel.disabled = false;
  this.classList.remove('err');
  setTimeout(function(){ sel.focus(); }, 100);
});

// URL inyectada por el servidor (evita error Safari iOS)
var FURL = '%%SCRIPT_URL%%';

document.getElementById('F').addEventListener('submit', function(ev){
  ev.preventDefault();
  hideAlerts();

  var lab  = g('lab'),  dpto = g('dpto'), ciu  = g('ciu');
  var nom  = g('nom'),  ape  = g('ape'),  tdoc = g('tdoc');
  var ndoc = g('ndoc'), cel  = g('cel');
  var mail = g('mail'), m2   = g('mail2');
  var dd   = g('dd'),   dm   = g('dm'),   dy   = g('dy');
  var prof = '';
  document.querySelectorAll('input[name=prof]').forEach(function(r){
    if (r.checked) prof = r.value;
  });

  var ok = true;
  ['lab','dpto','ciu','nom','ape','tdoc','ndoc','cel','mail','mail2','dd','dm','dy']
    .forEach(function(id){ if (!g(id)) { mark(id); ok = false; } });
  if (!prof) { document.getElementById('pw').classList.add('err'); ok = false; }

  if (!ok)                            return showErr('Por favor completa todos los campos obligatorios.');
  if (!mail.includes('@'))            return showErr('El correo electrónico no es válido.');
  if (mail !== m2)                    return showErr('Los correos no coinciden. Verifícalos.');
  if (cel.replace(/\D/g,'').length<7) return showErr('El número de celular no es válido.');
  if (!document.getElementById('trm').checked)
                                      return showErr('Debes aceptar los términos y condiciones.');

  busy(true);

  fetch(FURL, {
    method:  'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({
      laboratorio: lab, ciudad: ciu,  dpto: dpto,
      nombres: nom,     apellidos: ape, profesion: prof,
      tipo_doc: tdoc,   num_doc: ndoc, celular: cel,
      email: mail,      fecha_nac: dy + '-' + dm + '-' + dd
    })
  })
  .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(function(r){
    if (r.ok) {
      document.getElementById('aok').style.display = 'block';
      document.getElementById('F').reset();
      document.getElementById('ciu').disabled = true;
      document.getElementById('ciu').innerHTML = '<option value="">Primero selecciona el departamento</option>';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showErr('Error del servidor: ' + (r.msg || 'intenta de nuevo.'));
    }
  })
  .catch(function(){ showErr('No se pudo enviar. Verifica tu conexión e intenta de nuevo.'); })
  .finally(function(){ busy(false); });
});

// Limpiar errores al editar
document.querySelectorAll('input, select').forEach(function(el){
  ['input','change'].forEach(function(ev){
    el.addEventListener(ev, function(){ el.classList.remove('err'); });
  });
});
document.querySelectorAll('input[name=prof]').forEach(function(r){
  r.addEventListener('change', function(){
    document.getElementById('pw').classList.remove('err');
  });
});

function g(id)    { return document.getElementById(id).value.trim(); }
function mark(id) { document.getElementById(id).classList.add('err'); }
function hideAlerts() {
  document.getElementById('aok').style.display = 'none';
  document.getElementById('aer').style.display = 'none';
}
function showErr(msg) {
  var el = document.getElementById('aer');
  el.innerHTML = '⚠️ ' + msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function busy(on) {
  document.getElementById('btn').disabled           = on;
  document.getElementById('btxt').style.display     = on ? 'none'  : 'inline';
  document.getElementById('spin').style.display     = on ? 'block' : 'none';
}
</script>
</body>
</html>`;
