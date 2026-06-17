// ================================================================
//  POLLA MUNDIALISTA CEISCOL 2026 — Google Apps Script Backend
//  Pega este código en: script.google.com → Nuevo proyecto
//  Luego: Implementar → Nueva implementación → Aplicación web
//  Acceso: Cualquier persona  |  Ejecutar como: Yo
// ================================================================

const SHEET_ID   = 'TU_SHEET_ID_AQUI';   // <-- reemplaza con el ID de tu hoja
const NOTIFY_EMAIL = 'ceiscol.asistente@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    guardarEnSheet(data);
    enviarNotificacion(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Error doPost: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', msg: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('CEISCOL API activa ✓');
}

// ── Guardar en Google Sheet ──
function guardarEnSheet(d) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let   sheet = ss.getSheetByName('Registros');

  // Crear hoja y encabezados si no existe
  if (!sheet) {
    sheet = ss.insertSheet('Registros');
    const headers = [
      'Fecha Registro','Laboratorio','Ciudad',
      'Nombres','Apellidos','Documento','Celular','Correo',
      'Pronóstico Colombia','Pronóstico Portugal','Marcador'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#003087')
      .setFontColor('#FFD700');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    d.fecha,
    d.laboratorio,
    d.ciudad,
    d.nombres,
    d.apellidos,
    d.documento,
    d.celular,
    d.email,
    d.pronostico_colombia,
    d.pronostico_portugal,
    d.marcador
  ]);

  // Auto-ajustar columnas
  sheet.autoResizeColumns(1, 11);
}

// ── Enviar notificación por correo ──
function enviarNotificacion(d) {
  const asunto = `🇨🇴 Nuevo registro Polla CEISCOL — ${d.nombres} ${d.apellidos}`;
  const cuerpo = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#003087,#001a5e);padding:28px;text-align:center;">
      <h1 style="color:#FFD700;font-size:22px;margin:0;">&#9917; Polla Mundialista CEISCOL</h1>
      <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">Nuevo participante registrado</p>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#f8f9ff;"><td style="padding:10px 12px;color:#666;width:40%;"><b>Laboratorio</b></td><td style="padding:10px 12px;color:#1a1a2e;">${d.laboratorio}</td></tr>
        <tr><td style="padding:10px 12px;color:#666;"><b>Ciudad</b></td><td style="padding:10px 12px;color:#1a1a2e;">${d.ciudad}</td></tr>
        <tr style="background:#f8f9ff;"><td style="padding:10px 12px;color:#666;"><b>Bacteriólogo</b></td><td style="padding:10px 12px;color:#1a1a2e;">${d.nombres} ${d.apellidos}</td></tr>
        <tr><td style="padding:10px 12px;color:#666;"><b>Documento</b></td><td style="padding:10px 12px;color:#1a1a2e;">${d.documento}</td></tr>
        <tr style="background:#f8f9ff;"><td style="padding:10px 12px;color:#666;"><b>Celular</b></td><td style="padding:10px 12px;color:#1a1a2e;">${d.celular}</td></tr>
        <tr><td style="padding:10px 12px;color:#666;"><b>Correo</b></td><td style="padding:10px 12px;color:#1a1a2e;">${d.email}</td></tr>
      </table>
      <div style="background:linear-gradient(135deg,#003087,#001a5e);border-radius:10px;padding:20px;text-align:center;margin-top:20px;">
        <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0 0 8px;">PRONÓSTICO</p>
        <p style="color:#FFD700;font-size:32px;font-weight:bold;margin:0;letter-spacing:2px;">&#127464;&#127476; ${d.pronostico_colombia} &nbsp;–&nbsp; ${d.pronostico_portugal} &#127477;&#127481;</p>
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:8px 0 0;">Colombia vs Portugal</p>
      </div>
      <p style="color:#999;font-size:11px;margin-top:20px;text-align:center;">Registrado el: ${d.fecha}</p>
    </div>
  </div>
</body>
</html>`;

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: asunto,
    htmlBody: cuerpo
  });

  // Confirmación al bacteriólogo
  MailApp.sendEmail({
    to: d.email,
    subject: '✅ Tu pronóstico fue registrado — Polla Mundialista CEISCOL 2026',
    htmlBody: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#003087,#001a5e);padding:28px;text-align:center;">
      <p style="font-size:40px;margin:0;">🇨🇴</p>
      <h1 style="color:#FFD700;font-size:20px;margin:8px 0 0;">¡Registro exitoso!</h1>
    </div>
    <div style="padding:24px 28px;">
      <p style="color:#333;font-size:15px;">Hola <b>${d.nombres}</b>,</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Tu pronóstico para la Polla Mundialista CEISCOL 2026 fue registrado correctamente.</p>
      <div style="background:#f0f4ff;border-left:4px solid #003087;padding:16px;border-radius:0 8px 8px 0;margin:20px 0;">
        <p style="margin:0;color:#003087;font-size:14px;"><b>Tu marcador:</b></p>
        <p style="margin:8px 0 0;font-size:26px;font-weight:bold;color:#003087;">🇨🇴 ${d.pronostico_colombia} – ${d.pronostico_portugal} 🇵🇹</p>
        <p style="margin:4px 0 0;font-size:12px;color:#666;">Colombia vs Portugal</p>
      </div>
      <p style="color:#555;font-size:13px;">Laboratorio: <b>${d.laboratorio}</b><br>Registrado: ${d.fecha}</p>
      <p style="color:#888;font-size:12px;margin-top:20px;">¡Mucha suerte y vamos Colombia! ⚽</p>
    </div>
    <div style="background:#f8f9ff;padding:14px;text-align:center;">
      <p style="color:#aaa;font-size:11px;margin:0;">CEISCOL &bull; Polla Mundialista 2026</p>
    </div>
  </div>
</body>
</html>`
  });
}
