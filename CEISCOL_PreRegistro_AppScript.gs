// ╔══════════════════════════════════════════════════════════════╗
// ║   POLLA MUNDIALISTA CEISCOL 2026 — PRE-REGISTRO             ║
// ║   Un solo archivo — Pega en script.google.com               ║
// ║   Implementar → Nueva implementación → Aplicación web       ║
// ║   Ejecutar como: Yo  |  Acceso: Cualquier persona           ║
// ╚══════════════════════════════════════════════════════════════╝

var REMITENTE_NOMBRE = 'CEISCOL Polla Mundialista 2026';
var EMAIL_CEISCOL    = 'ceiscol.asistente@gmail.com';

// ── Sirve el formulario ──────────────────────────────────────────
function doGet() {
  return HtmlService
    .createHtmlOutput(HTML_FORM)
    .setTitle('Pre-Registro — Polla Mundialista CEISCOL 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── Recibe y procesa el formulario ──────────────────────────────
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = obtenerOCrearSheet();
    var fila = guardarRegistro(ss, d);
    enviarConfirmacion(d);
    registrarMensaje(ss, d, fila);
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

// ── Crear / abrir Spreadsheet ────────────────────────────────────
function obtenerOCrearSheet() {
  var archivos = DriveApp.getFilesByName('Polla Mundialista CEISCOL 2026');
  var ss;
  if (archivos.hasNext()) {
    ss = SpreadsheetApp.open(archivos.next());
  } else {
    ss = SpreadsheetApp.create('Polla Mundialista CEISCOL 2026');
    inicializarHojas(ss);
  }
  // Si ya existe pero le faltan hojas
  if (!ss.getSheetByName('Registros'))      crearHojaRegistros(ss);
  if (!ss.getSheetByName('Mensajes'))        crearHojaMensajes(ss);
  if (!ss.getSheetByName('Dashboard'))       crearHojaDashboard(ss);
  return ss;
}

function inicializarHojas(ss) {
  var hojaDef = ss.getSheets()[0];
  hojaDef.setName('Registros');
  darFormatoRegistros(hojaDef);
  crearHojaMensajes(ss);
  crearHojaDashboard(ss);
}

// ── Hoja REGISTROS ───────────────────────────────────────────────
function crearHojaRegistros(ss) {
  var h = ss.insertSheet('Registros', 0);
  darFormatoRegistros(h);
}

function darFormatoRegistros(h) {
  var headers = [
    '# Reg.','Fecha','Hora','Laboratorio','Ciudad / Dpto',
    'Nombres','Apellidos','Documento','Cargo','Celular',
    'Correo Personal','Estado Link','Observaciones'
  ];
  h.clearFormats();
  h.clearContents();

  // Fila de título
  h.setRowHeight(1, 40);
  h.getRange(1, 1, 1, headers.length)
    .merge()
    .setValue('⚽  POLLA MUNDIALISTA CEISCOL 2026  •  PRE-REGISTROS COLOMBIA 🇨🇴')
    .setBackground('#CE1126')
    .setFontColor('#FFD700')
    .setFontWeight('bold')
    .setFontSize(12)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Fila de encabezados
  h.setRowHeight(2, 32);
  var rH = h.getRange(2, 1, 1, headers.length);
  rH.setValues([headers])
    .setBackground('#003087')
    .setFontColor('#FFD700')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Anchos
  var anchos = [60,90,70,200,130,130,130,100,120,110,200,110,180];
  anchos.forEach(function(w, i){ h.setColumnWidth(i+1, w); });
  h.setFrozenRows(2);

  // Validación Estado Link
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendiente','Link Enviado','Confirmado','No responde'])
    .build();
  h.getRange(3, 12, 500, 1).setDataValidation(rule);

  // Formato condicional col 12
  var reglas = [
    h.newConditionalFormatRule().whenTextEqualTo('Pendiente').setBackground('#FFF3CD').setFontColor('#856404').setRanges([h.getRange(3,12,500,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Link Enviado').setBackground('#D1ECF1').setFontColor('#0C5460').setRanges([h.getRange(3,12,500,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('Confirmado').setBackground('#D4EDDA').setFontColor('#155724').setRanges([h.getRange(3,12,500,1)]).build(),
    h.newConditionalFormatRule().whenTextEqualTo('No responde').setBackground('#F8D7DA').setFontColor('#721C24').setRanges([h.getRange(3,12,500,1)]).build()
  ];
  h.setConditionalFormatRules(reglas);

  // Bordes zona de datos
  h.getRange(2, 1, 1, headers.length)
    .setBorder(true,true,true,true,true,true,'#FFD700',SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

// ── Hoja MENSAJES ────────────────────────────────────────────────
function crearHojaMensajes(ss) {
  var h = ss.insertSheet('Mensajes');
  var headers = ['# Msg','Fecha','Hora','Destinatario','Correo','Tipo Mensaje','Asunto','Estado Envío','Ref. Registro'];

  h.setRowHeight(1, 40);
  h.getRange(1, 1, 1, headers.length)
    .merge()
    .setValue('📨  SEGUIMIENTO DE MENSAJES ENVIADOS — CEISCOL 2026')
    .setBackground('#003087')
    .setFontColor('#FFD700')
    .setFontWeight('bold')
    .setFontSize(12)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  h.setRowHeight(2, 32);
  h.getRange(2, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#FFD700')
    .setFontColor('#003087')
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  var anchos = [60,90,70,160,200,150,250,120,100];
  anchos.forEach(function(w,i){ h.setColumnWidth(i+1, w); });
  h.setFrozenRows(2);

  var ruleE = SpreadsheetApp.newDataValidation()
    .requireValueInList(['✅ Enviado','❌ Error','⏳ Pendiente'])
    .build();
  h.getRange(3, 8, 500, 1).setDataValidation(ruleE);
}

// ── Hoja DASHBOARD ───────────────────────────────────────────────
function crearHojaDashboard(ss) {
  var h = ss.insertSheet('Dashboard');

  h.setRowHeight(1, 50);
  h.getRange(1,1,1,6).merge()
    .setValue('🏆  DASHBOARD — POLLA MUNDIALISTA CEISCOL 2026')
    .setBackground('#CE1126')
    .setFontColor('#FFD700')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  var labels = [
    ['','TOTAL REGISTROS',    '=COUNTA(Registros!F3:F)'],
    ['','LINKS ENVIADOS',     '=COUNTIF(Registros!L3:L,"Link Enviado")'],
    ['','CONFIRMADOS',        '=COUNTIF(Registros!L3:L,"Confirmado")'],
    ['','PENDIENTES',         '=COUNTIF(Registros!L3:L,"Pendiente")'],
    ['','MENSAJES ENVIADOS',  '=COUNTA(Mensajes!E3:E)'],
    ['','ÚLTIMA ACTUALIZACIÓN','=TEXT(NOW(),"DD/MM/YYYY HH:MM")'],
  ];

  var colores = ['#003087','#0077B6','#28A745','#FFC107','#6F42C1','#555'];

  labels.forEach(function(row, i) {
    var r = i + 3;
    h.setRowHeight(r, 56);
    h.getRange(r, 2).setValue(row[1])
      .setBackground(colores[i])
      .setFontColor('#fff')
      .setFontWeight('bold')
      .setFontSize(11)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    h.getRange(r, 3).setFormula(row[2])
      .setBackground('#f8f9ff')
      .setFontColor(colores[i])
      .setFontWeight('bold')
      .setFontSize(22)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    h.setColumnWidth(2, 200);
    h.setColumnWidth(3, 120);
  });

  h.getRange(3,2,labels.length,2)
    .setBorder(true,true,true,true,true,true,'#ddd',SpreadsheetApp.BorderStyle.SOLID);
}

// ── Guardar registro ─────────────────────────────────────────────
function guardarRegistro(ss, d) {
  var h = ss.getSheetByName('Registros');
  var ultimo = Math.max(h.getLastRow(), 2);
  var numReg = ultimo - 1;
  var ahora = new Date();

  var fila = [
    numReg,
    Utilities.formatDate(ahora, 'America/Bogota', 'dd/MM/yyyy'),
    Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss'),
    d.laboratorio,
    d.ciudad,
    d.nombres,
    d.apellidos,
    d.documento,
    d.cargo,
    d.celular,
    d.email,
    'Pendiente',
    ''
  ];

  var nuevaFila = ultimo + 1;
  h.appendRow(fila);

  // Formato de fila alternado
  var color = (numReg % 2 === 0) ? '#EEF2FB' : '#FFFFFF';
  h.getRange(nuevaFila, 1, 1, fila.length).setBackground(color).setFontSize(10);
  h.getRange(nuevaFila, 1).setHorizontalAlignment('center').setFontWeight('bold').setFontColor('#003087');

  return numReg;
}

// ── Registrar mensaje enviado ─────────────────────────────────────
function registrarMensaje(ss, d, numReg) {
  var h = ss.getSheetByName('Mensajes');
  var num = Math.max(h.getLastRow() - 1, 0) + 1;
  var ahora = new Date();
  var asunto = 'Pre-registro Polla Mundialista CEISCOL 2026 — Confirmación';

  var fila = [
    num,
    Utilities.formatDate(ahora, 'America/Bogota', 'dd/MM/yyyy'),
    Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss'),
    d.nombres + ' ' + d.apellidos,
    d.email,
    'Confirmación Pre-registro',
    asunto,
    '✅ Enviado',
    numReg
  ];

  h.appendRow(fila);
  var fil = h.getLastRow();
  var color = (num % 2 === 0) ? '#F0F4FF' : '#FFFFFF';
  h.getRange(fil, 1, 1, fila.length).setBackground(color).setFontSize(10);
}

// ── Correo de confirmación ────────────────────────────────────────
function enviarConfirmacion(d) {
  var nombre = d.nombres + ' ' + d.apellidos;
  var asunto = '⚽ Pre-registro exitoso — Polla Mundialista CEISCOL 2026';

  var cuerpo = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
  + '<style>*{margin:0;padding:0;box-sizing:border-box;} body{font-family:Arial,sans-serif;background:#f4f4f4;}'
  + '.wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);}'
  + '</style></head><body style="padding:20px;">'
  + '<div class="wrap">'

  // Banda tricolor
  + '<div style="display:flex;height:8px;">'
  + '<div style="flex:1;background:#FFD700;"></div>'
  + '<div style="flex:1;background:#003087;"></div>'
  + '<div style="flex:1;background:#CE1126;"></div>'
  + '</div>'

  // Hero
  + '<div style="background:linear-gradient(135deg,#003087 0%,#001a5e 60%,#CE1126 100%);padding:32px 28px;text-align:center;">'
  + '<div style="font-size:52px;line-height:1;">⚽</div>'
  + '<h1 style="color:#FFD700;font-size:22px;font-weight:700;margin-top:10px;letter-spacing:0.5px;">¡Pre-registro exitoso!</h1>'
  + '<p style="color:rgba(255,255,255,.75);font-size:13px;margin-top:6px;">Polla Mundialista CEISCOL 2026</p>'
  + '<p style="color:rgba(255,255,255,.5);font-size:11px;margin-top:4px;letter-spacing:1px;">🇨🇴 COLOMBIA vs PORTUGAL 🇵🇹</p>'
  + '</div>'

  // Cuerpo
  + '<div style="padding:28px;">'
  + '<p style="font-size:15px;color:#1a1a2e;">Hola <b style="color:#003087;">' + nombre + '</b>,</p>'
  + '<p style="font-size:14px;color:#555;line-height:1.7;margin-top:12px;">'
  + 'Tu pre-registro para la <b>Polla Mundialista CEISCOL 2026</b> fue recibido correctamente. 🎉'
  + '</p>'

  // Caja de aviso
  + '<div style="background:linear-gradient(135deg,#FFF8DC,#FFF3CD);border:2px solid #FFD700;border-radius:10px;padding:20px 22px;margin:22px 0;text-align:center;">'
  + '<div style="font-size:32px;">📲</div>'
  + '<p style="font-size:15px;font-weight:700;color:#003087;margin-top:8px;">Próximamente recibirás el link</p>'
  + '<p style="font-size:13px;color:#555;line-height:1.6;margin-top:6px;">'
  + 'Te enviaremos a este correo el <b>link exclusivo</b> desde donde podrás ingresar tu marcador y participar oficialmente en la polla. '
  + 'Este es tu <b>registro de participación</b>. ¡Mantente atento!'
  + '</p>'
  + '</div>'

  // Datos registrados
  + '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:4px;">'
  + '<tr style="background:#003087;"><th colspan="2" style="color:#FFD700;padding:9px 12px;text-align:left;font-size:11px;letter-spacing:1px;">TUS DATOS REGISTRADOS</th></tr>'
  + '<tr style="background:#f8f9ff;"><td style="padding:9px 12px;color:#667;width:40%;">Laboratorio</td><td style="padding:9px 12px;color:#1a1a2e;font-weight:500;">' + d.laboratorio + '</td></tr>'
  + '<tr><td style="padding:9px 12px;color:#667;">Ciudad</td><td style="padding:9px 12px;color:#1a1a2e;font-weight:500;">' + d.ciudad + '</td></tr>'
  + '<tr style="background:#f8f9ff;"><td style="padding:9px 12px;color:#667;">Bacteriólogo</td><td style="padding:9px 12px;color:#1a1a2e;font-weight:500;">' + nombre + '</td></tr>'
  + '<tr><td style="padding:9px 12px;color:#667;">Cargo</td><td style="padding:9px 12px;color:#1a1a2e;font-weight:500;">' + d.cargo + '</td></tr>'
  + '<tr style="background:#f8f9ff;"><td style="padding:9px 12px;color:#667;">Correo</td><td style="padding:9px 12px;color:#1a1a2e;font-weight:500;">' + d.email + '</td></tr>'
  + '</table>'

  + '<p style="font-size:12px;color:#aaa;margin-top:22px;text-align:center;">¡Vamos Colombia! 💛💙❤️ &bull; CEISCOL 2026</p>'
  + '</div>'

  // Banda tricolor pie
  + '<div style="display:flex;height:8px;">'
  + '<div style="flex:1;background:#CE1126;"></div>'
  + '<div style="flex:1;background:#003087;"></div>'
  + '<div style="flex:1;background:#FFD700;"></div>'
  + '</div>'
  + '</div></body></html>';

  MailApp.sendEmail({ to: d.email, subject: asunto, htmlBody: cuerpo, name: REMITENTE_NOMBRE });

  // Notificación a CEISCOL
  MailApp.sendEmail({
    to: EMAIL_CEISCOL,
    subject: '🔔 Nuevo pre-registro — ' + nombre + ' | ' + d.laboratorio,
    htmlBody: '<div style="font-family:Arial;max-width:520px;padding:20px;">'
      + '<h2 style="color:#003087;">⚽ Nuevo pre-registro recibido</h2>'
      + '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">'
      + '<tr style="background:#003087;"><th colspan="2" style="color:#FFD700;padding:8px 12px;text-align:left;">DATOS DEL PARTICIPANTE</th></tr>'
      + '<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#667;">Laboratorio</td><td style="padding:8px 12px;"><b>' + d.laboratorio + '</b></td></tr>'
      + '<tr><td style="padding:8px 12px;color:#667;">Ciudad</td><td style="padding:8px 12px;">' + d.ciudad + '</td></tr>'
      + '<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#667;">Nombre</td><td style="padding:8px 12px;"><b>' + nombre + '</b></td></tr>'
      + '<tr><td style="padding:8px 12px;color:#667;">Cargo</td><td style="padding:8px 12px;">' + d.cargo + '</td></tr>'
      + '<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#667;">Documento</td><td style="padding:8px 12px;">' + d.documento + '</td></tr>'
      + '<tr><td style="padding:8px 12px;color:#667;">Celular</td><td style="padding:8px 12px;">' + d.celular + '</td></tr>'
      + '<tr style="background:#f8f9ff;"><td style="padding:8px 12px;color:#667;">Correo</td><td style="padding:8px 12px;"><b>' + d.email + '</b></td></tr>'
      + '</table></div>',
    name: 'Sistema CEISCOL 2026'
  });
}

// ════════════════════════════════════════════════════════════════
//  HTML DEL FORMULARIO
// ════════════════════════════════════════════════════════════════
var HTML_FORM = '<!DOCTYPE html>\n'
+ '<html lang="es">\n'
+ '<head>\n'
+ '<meta charset="UTF-8"/>\n'
+ '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>\n'
+ '<title>Pre-Registro Polla Mundialista CEISCOL 2026</title>\n'
+ '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>\n'
+ '<style>\n'
+ '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\n'
+ 'body{font-family:"Inter",Arial,sans-serif;background:#0d1117;min-height:100vh;color:#e8eaf0;\n'
+ '  background-image:radial-gradient(ellipse at 20% 10%,rgba(255,215,0,.07) 0%,transparent 45%),\n'
+ '  radial-gradient(ellipse at 80% 90%,rgba(206,17,38,.08) 0%,transparent 45%),\n'
+ '  radial-gradient(ellipse at 50% 50%,rgba(0,48,135,.12) 0%,transparent 60%);}\n'

// Banda tricolor animada top
+ '.tricolor{display:flex;height:5px;position:fixed;top:0;left:0;right:0;z-index:100;}\n'
+ '.t1{flex:1;background:#FFD700;} .t2{flex:1;background:#003087;} .t3{flex:1;background:#CE1126;}\n'

// Hero
+ '.hero{padding:38px 20px 56px;text-align:center;position:relative;overflow:hidden;\n'
+ '  background:linear-gradient(160deg,#001a5e 0%,#003087 35%,#1a0008 70%,#CE1126 100%);}\n'
+ '.hero::before{content:"";position:absolute;inset:0;\n'
+ '  background:repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 18px);}\n'
+ '.hero-balls{position:absolute;inset:0;pointer-events:none;overflow:hidden;}\n'
+ '.ball{position:absolute;border-radius:50%;border:2px solid rgba(255,215,0,.15);animation:pulse 3s ease-in-out infinite;}\n'
+ '.ball:nth-child(1){width:180px;height:180px;top:-40px;left:-40px;animation-delay:0s;}\n'
+ '.ball:nth-child(2){width:120px;height:120px;bottom:-20px;right:-20px;animation-delay:1s;}\n'
+ '.ball:nth-child(3){width:80px;height:80px;top:40%;right:5%;animation-delay:2s;border-color:rgba(206,17,38,.2);}\n'
+ '@keyframes pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.08);opacity:.8}}\n'
+ '.badge{display:inline-flex;align-items:center;gap:7px;background:rgba(255,215,0,.12);\n'
+ '  border:1px solid rgba(255,215,0,.35);border-radius:20px;padding:5px 16px;\n'
+ '  font-size:10px;color:#FFD700;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-bottom:16px;}\n'
+ '.hero h1{font-family:"Oswald",sans-serif;font-size:clamp(24px,6vw,46px);font-weight:700;\n'
+ '  color:#fff;line-height:1.15;letter-spacing:.5px;position:relative;}\n'
+ '.hero h1 .gold{color:#FFD700;} .hero h1 .red{color:#FF6B6B;}\n'
+ '.hero .sub{font-size:12px;color:rgba(255,255,255,.55);margin-top:8px;letter-spacing:1px;text-transform:uppercase;position:relative;}\n'
+ '.flags{font-size:38px;margin-bottom:4px;filter:drop-shadow(0 3px 8px rgba(0,0,0,.5));}\n'

// Info banner
+ '.info-banner{max-width:600px;margin:-28px auto 0;padding:0 16px;position:relative;z-index:10;}\n'
+ '.info-card{background:linear-gradient(135deg,rgba(255,215,0,.12),rgba(0,48,135,.15));\n'
+ '  border:1.5px solid rgba(255,215,0,.3);border-radius:12px;padding:14px 18px;\n'
+ '  display:flex;gap:12px;align-items:flex-start;}\n'
+ '.info-icon{font-size:28px;flex-shrink:0;margin-top:2px;}\n'
+ '.info-txt h3{font-size:13px;font-weight:600;color:#FFD700;margin-bottom:4px;}\n'
+ '.info-txt p{font-size:11.5px;color:rgba(255,255,255,.65);line-height:1.6;}\n'

// Form
+ '.form-wrap{max-width:600px;margin:20px auto 0;padding:0 16px 40px;}\n'
+ '.card{background:rgba(22,28,46,.9);backdrop-filter:blur(12px);\n'
+ '  border:1px solid rgba(255,215,0,.15);border-radius:16px;padding:26px 24px;\n'
+ '  box-shadow:0 24px 64px rgba(0,0,0,.5);}\n'
+ '.sec-title{font-family:"Oswald",sans-serif;font-size:11px;letter-spacing:2.5px;\n'
+ '  color:#FFD700;text-transform:uppercase;margin-bottom:14px;\n'
+ '  display:flex;align-items:center;gap:10px;}\n'
+ '.sec-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(255,215,0,.4),transparent);}\n'
+ '.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}\n'
+ '@media(max-width:480px){.grid{grid-template-columns:1fr;}}\n'
+ '.f{display:flex;flex-direction:column;gap:5px;} .f.full{grid-column:1/-1;}\n'
+ 'label{font-size:10px;font-weight:600;color:rgba(255,255,255,.4);letter-spacing:1.2px;text-transform:uppercase;}\n'
+ 'label .r{color:#FFD700;margin-left:2px;}\n'
+ 'input,select{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);\n'
+ '  border-radius:8px;color:#e8eaf0;font-size:13.5px;padding:11px 14px;width:100%;\n'
+ '  font-family:"Inter",sans-serif;transition:border-color .2s,box-shadow .2s,background .2s;}\n'
+ 'select option{background:#1a2236;}\n'
+ 'input::placeholder{color:rgba(255,255,255,.18);}\n'
+ 'input:focus,select:focus{outline:none;border-color:#FFD700;\n'
+ '  box-shadow:0 0 0 3px rgba(255,215,0,.1);background:rgba(255,255,255,.07);}\n'
+ 'input.err{border-color:#CE1126!important;box-shadow:0 0 0 3px rgba(206,17,38,.12)!important;}\n'
+ '.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,.2),transparent);margin:20px 0;}\n'

// Terms
+ '.terms{display:flex;align-items:flex-start;gap:10px;margin-top:4px;}\n'
+ '.terms input[type=checkbox]{width:17px;height:17px;min-width:17px;accent-color:#FFD700;cursor:pointer;margin-top:2px;}\n'
+ '.terms label{text-transform:none;letter-spacing:0;font-size:11.5px;color:rgba(255,255,255,.4);line-height:1.55;}\n'

// Alerts
+ '.alert{border-radius:10px;padding:14px 17px;font-size:13px;line-height:1.55;margin-top:14px;display:none;}\n'
+ '.ok{background:rgba(40,167,69,.1);border:1px solid rgba(40,167,69,.35);color:#6fcf97;}\n'
+ '.nok{background:rgba(206,17,38,.1);border:1px solid rgba(206,17,38,.35);color:#ff8080;}\n'

// Button
+ '.btn{width:100%;padding:15px;margin-top:20px;border:none;border-radius:10px;cursor:pointer;\n'
+ '  font-family:"Oswald",sans-serif;font-size:17px;font-weight:700;letter-spacing:1.5px;\n'
+ '  text-transform:uppercase;transition:all .2s;position:relative;overflow:hidden;\n'
+ '  background:linear-gradient(90deg,#FFD700,#FFA500,#CE1126);\n'
+ '  background-size:200% 100%;color:#fff;\n'
+ '  text-shadow:0 1px 3px rgba(0,0,0,.3);\n'
+ '  box-shadow:0 4px 22px rgba(206,17,38,.3);}\n'
+ '.btn::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);\n'
+ '  transform:translateX(-100%);transition:transform .5s;}\n'
+ '.btn:hover::before{transform:translateX(100%);}\n'
+ '.btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(206,17,38,.45);}\n'
+ '.btn:active{transform:translateY(0);}\n'
+ '.btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}\n'
+ '.spin{display:none;width:20px;height:20px;border:3px solid rgba(255,255,255,.25);\n'
+ '  border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite;margin:0 auto;}\n'
+ '@keyframes sp{to{transform:rotate(360deg)}}\n'

// Footer
+ 'footer{text-align:center;padding:20px;font-size:10px;color:rgba(255,255,255,.2);letter-spacing:1px;}\n'
+ 'footer strong{color:rgba(255,215,0,.4);}\n'
+ '</style>\n'
+ '</head>\n'
+ '<body>\n'

+ '<div class="tricolor"><div class="t1"></div><div class="t2"></div><div class="t3"></div></div>\n'

// Hero
+ '<div class="hero">\n'
+ '  <div class="hero-balls"><div class="ball"></div><div class="ball"></div><div class="ball"></div></div>\n'
+ '  <div style="position:relative;z-index:1;">\n'
+ '    <div class="flags">🇨🇴 ⚽ 🇵🇹</div>\n'
+ '    <div class="badge">🏆 Copa Mundo 2026 &nbsp;|&nbsp; CEISCOL</div>\n'
+ '    <h1>PRE-REGISTRO<br><span class="gold">POLLA MUNDIALISTA</span><br><span class="red">CEISCOL 2026</span></h1>\n'
+ '    <p class="sub">Colombia 🇨🇴 vs Portugal 🇵🇹 &bull; Solo para bacteriólogos</p>\n'
+ '  </div>\n'
+ '</div>\n'

// Info banner
+ '<div class="info-banner">\n'
+ '  <div class="info-card">\n'
+ '    <div class="info-icon">📲</div>\n'
+ '    <div class="info-txt">\n'
+ '      <h3>¿Cómo funciona?</h3>\n'
+ '      <p>Regístrate aquí con tus datos. <strong style="color:#FFD700;">Próximamente recibirás en tu correo el link exclusivo</strong> desde donde podrás ingresar tu marcador y participar oficialmente en la polla. Este formulario es tu inscripción como participante.</p>\n'
+ '    </div>\n'
+ '  </div>\n'
+ '</div>\n'

// Form
+ '<div class="form-wrap">\n'
+ '<div class="card">\n'
+ '<form id="frm" novalidate>\n'

+ '<div class="sec-title">🏥 Datos del Laboratorio</div>\n'
+ '<div class="grid">\n'
+ '  <div class="f full"><label>Nombre del Laboratorio <span class="r">*</span></label><input type="text" id="lab" placeholder="Ej. Laboratorio Clínico San Rafael" required/></div>\n'
+ '  <div class="f"><label>Ciudad / Municipio <span class="r">*</span></label><input type="text" id="ciu" placeholder="Bogotá, Medellín..." required/></div>\n'
+ '  <div class="f"><label>Departamento <span class="r">*</span></label><input type="text" id="dpto" placeholder="Cundinamarca..." required/></div>\n'
+ '</div>\n'

+ '<div class="divider"></div>\n'
+ '<div class="sec-title">🔬 Datos del Bacteriólogo</div>\n'
+ '<div class="grid">\n'
+ '  <div class="f"><label>Nombres <span class="r">*</span></label><input type="text" id="nom" placeholder="Tu(s) nombre(s)" required/></div>\n'
+ '  <div class="f"><label>Apellidos <span class="r">*</span></label><input type="text" id="ape" placeholder="Tu(s) apellido(s)" required/></div>\n'
+ '  <div class="f"><label>Tipo de documento <span class="r">*</span></label>\n'
+ '    <select id="tdoc"><option value="">Selecciona...</option><option>Cédula de Ciudadanía</option><option>Cédula Extranjería</option><option>Pasaporte</option></select>\n'
+ '  </div>\n'
+ '  <div class="f"><label>Número de documento <span class="r">*</span></label><input type="text" id="doc" placeholder="Número" required/></div>\n'
+ '  <div class="f"><label>Cargo <span class="r">*</span></label>\n'
+ '    <select id="cargo"><option value="">Selecciona...</option><option>Bacteriólogo(a)</option><option>Microbiólogo(a)</option><option>Director(a) Técnico</option><option>Coordinador(a) de Lab.</option><option>Auxiliar de Lab.</option><option>Otro</option></select>\n'
+ '  </div>\n'
+ '  <div class="f"><label>Celular <span class="r">*</span></label><input type="tel" id="cel" placeholder="3XXXXXXXXX" required/></div>\n'
+ '  <div class="f full"><label>Correo personal <span class="r">*</span></label><input type="email" id="mail" placeholder="ejemplo@gmail.com" required/></div>\n'
+ '  <div class="f full"><label>Confirmar correo <span class="r">*</span></label><input type="email" id="mail2" placeholder="Repite tu correo" required/></div>\n'
+ '</div>\n'

+ '<div class="divider"></div>\n'
+ '<div class="terms">\n'
+ '  <input type="checkbox" id="trm"/>\n'
+ '  <label for="trm">Autorizo el uso de mis datos personales exclusivamente para la Polla Mundialista CEISCOL 2026 y el envío de comunicaciones relacionadas con este evento, conforme a la Ley 1581 de 2012.</label>\n'
+ '</div>\n'

+ '<div class="alert ok" id="ok">✅ &nbsp;<strong>¡Pre-registro exitoso!</strong> En breve recibirás un correo con la confirmación. Cuando el link esté listo te lo enviaremos para que ingreses tu marcador. ¡Vamos Colombia! 🇨🇴</div>\n'
+ '<div class="alert nok" id="nok"><span id="etxt">Error al enviar.</span></div>\n'

+ '<button type="submit" class="btn" id="btn">\n'
+ '  <span id="btxt">⚽&nbsp; REGISTRARME PARA LA POLLA</span>\n'
+ '  <div class="spin" id="spn"></div>\n'
+ '</button>\n'
+ '</form>\n'
+ '</div>\n'
+ '</div>\n'

+ '<footer><strong>CEISCOL</strong> &bull; Polla Mundialista 2026 &bull; Solo para bacteriólogos registrados<br>Colombia 🇨🇴 vs Portugal 🇵🇹 &bull; ¡Vamos la Tricolor!</footer>\n'

+ '<script>\n'
+ 'var URL=window.location.href.split("?")[0];\n'
+ 'document.getElementById("frm").addEventListener("submit",function(e){\n'
+ '  e.preventDefault(); hide();\n'
+ '  var lab=v("lab"),ciu=v("ciu"),dpto=v("dpto"),nom=v("nom"),ape=v("ape"),\n'
+ '      tdoc=v("tdoc"),doc=v("doc"),cargo=v("cargo"),cel=v("cel"),\n'
+ '      mail=v("mail"),mail2=v("mail2");\n'
+ '  var ok=true;\n'
+ '  ["lab","ciu","dpto","nom","ape","tdoc","doc","cargo","cel","mail","mail2"].forEach(function(id){\n'
+ '    if(!v(id)){document.getElementById(id).classList.add("err");ok=false;}\n'
+ '  });\n'
+ '  if(!ok){err("Por favor completa todos los campos.");return;}\n'
+ '  if(!mail.includes("@")){err("El correo no es válido.");return;}\n'
+ '  if(mail!==mail2){err("Los correos no coinciden. Verifícalos.");return;}\n'
+ '  if(cel.length<7){err("Ingresa un celular válido.");return;}\n'
+ '  if(!document.getElementById("trm").checked){err("Debes aceptar la autorización de datos.");return;}\n'
+ '  load(true);\n'
+ '  var d={laboratorio:lab,ciudad:ciu+" - "+dpto,nombres:nom,apellidos:ape,\n'
+ '         documento:tdoc+" "+doc,cargo:cargo,celular:cel,email:mail};\n'
+ '  fetch(URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)})\n'
+ '    .then(function(r){return r.json();})\n'
+ '    .then(function(r){\n'
+ '      if(r.ok){document.getElementById("ok").style.display="block";\n'
+ '               document.getElementById("frm").reset();\n'
+ '               window.scrollTo({top:0,behavior:"smooth"});}\n'
+ '      else{err("Error del servidor. Intenta de nuevo.");}\n'
+ '    })\n'
+ '    .catch(function(){err("Sin conexión. Verifica tu internet.");})\n'
+ '    .finally(function(){load(false);});\n'
+ '});\n'
+ 'document.querySelectorAll("input,select").forEach(function(el){\n'
+ '  el.addEventListener("input",function(){el.classList.remove("err");});});\n'
+ 'function v(id){return document.getElementById(id).value.trim();}\n'
+ 'function hide(){document.getElementById("ok").style.display="none";document.getElementById("nok").style.display="none";}\n'
+ 'function err(m){document.getElementById("etxt").textContent=m;document.getElementById("nok").style.display="block";}\n'
+ 'function load(on){document.getElementById("btn").disabled=on;document.getElementById("btxt").style.display=on?"none":"inline";document.getElementById("spn").style.display=on?"block":"none";}\n'
+ '</script>\n'
+ '</body></html>';
