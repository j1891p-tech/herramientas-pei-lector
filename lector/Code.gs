/**
 * LECTOR PEI · servidor en Google Sheets (nube propia, gratis)
 * ------------------------------------------------------------
 * 1. Cree una hoja de cálculo nueva en Google Drive («Lector PEI datos»).
 * 2. Extensiones → Apps Script. Borre lo que haya y pegue TODO este archivo.
 * 3. Cambie la CLAVE de abajo por una suya (la misma que pondrá en la app).
 * 4. Implementar → Nueva implementación → tipo «Aplicación web»
 *      Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 *    Autorice los permisos (Hojas y Drive). Copie la URL que termina en /exec.
 * 5. En la app: Más → Nube → pegue la URL y la clave → Probar conexión.
 * Si cambia este código: Implementar → Gestionar implementaciones → editar → Nueva versión.
 */
const CLAVE = 'CAMBIE-ESTA-CLAVE';
const TABS = ['cursos', 'estudiantes', 'quizzes', 'resultados'];
const CARPETA_IMG = 'Lector PEI · hojas escaneadas';

function doGet() {
  return out({ ok: true, app: 'lector-pei', msg: 'Servidor activo. La app se conecta por POST.' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'Solicitud inválida' }); }
  if (req.token !== CLAVE) return out({ ok: false, error: 'Clave incorrecta' });
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    if (req.action === 'ping') return out({ ok: true, now: Date.now(), hoja: SpreadsheetApp.getActive().getName() });
    if (req.action === 'pull') return out({ ok: true, now: Date.now(), items: pull(Number(req.since) || 0) });
    if (req.action === 'push') { const r = push(req.items || []); return out({ ok: true, now: Date.now(), saved: r }); }
    if (req.action === 'img') return out({ ok: true, data: getImg(String(req.id)) });
    return out({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function hoja(nombre) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(nombre);
  if (!sh) { sh = ss.insertSheet(nombre); sh.appendRow(['id', 'srv', 'cli', 'borrado', 'json']); sh.setFrozenRows(1); }
  return sh;
}

function pull(since) {
  const items = [];
  TABS.forEach(function (t) {
    const v = hoja(t).getDataRange().getValues();
    for (let i = 1; i < v.length; i++) {
      const r = v[i];
      if (Number(r[1]) > since) items.push({ tab: t, id: String(r[0]), cli: Number(r[2]), del: r[3] === true || r[3] === 'TRUE', data: r[4] ? JSON.parse(r[4]) : null });
    }
  });
  return items;
}

function push(items) {
  const saved = [];
  const porTab = {};
  items.forEach(function (it) { (porTab[it.tab] = porTab[it.tab] || []).push(it); });
  Object.keys(porTab).forEach(function (t) {
    if (TABS.indexOf(t) < 0) return;
    const sh = hoja(t);
    const v = sh.getDataRange().getValues();
    const fila = {};
    for (let i = 1; i < v.length; i++) fila[String(v[i][0])] = { n: i + 1, cli: Number(v[i][2]), json: v[i][4] };
    porTab[t].forEach(function (it) {
      const id = String(it.id);
      const ex = fila[id];
      if (ex && ex.cli > Number(it.cli)) { saved.push({ tab: t, id: id, skipped: true }); return; } // en la nube hay algo más nuevo
      const data = it.data || {};
      if (it.img) data.imgId = guardarImg(id, it.img);
      else if (ex && ex.json && !data.imgId) { try { const prev = JSON.parse(ex.json); if (prev.imgId) data.imgId = prev.imgId; } catch (e) {} }
      const row = [id, Date.now(), Number(it.cli), !!it.del, JSON.stringify(data)];
      if (ex) sh.getRange(ex.n, 1, 1, 5).setValues([row]);
      else { sh.appendRow(row); fila[id] = { n: sh.getLastRow(), cli: Number(it.cli), json: row[4] }; }
      saved.push({ tab: t, id: id, imgId: data.imgId || null });
    });
  });
  return saved;
}

function carpeta() {
  const it = DriveApp.getFoldersByName(CARPETA_IMG);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_IMG);
}

function guardarImg(id, dataUrl) {
  const b64 = String(dataUrl).replace(/^data:image\/\w+;base64,/, '');
  const nombre = id.replace(/[^\w.-]+/g, '_') + '.jpg';
  const c = carpeta();
  const viejos = c.getFilesByName(nombre);
  while (viejos.hasNext()) viejos.next().setTrashed(true);
  const f = c.createFile(Utilities.newBlob(Utilities.base64Decode(b64), 'image/jpeg', nombre));
  return f.getId();
}

function getImg(resultId) {
  const v = hoja('resultados').getDataRange().getValues();
  for (let i = 1; i < v.length; i++) {
    if (String(v[i][0]) === resultId && v[i][4]) {
      const d = JSON.parse(v[i][4]);
      if (!d.imgId) return null;
      const blob = DriveApp.getFileById(d.imgId).getBlob();
      return 'data:image/jpeg;base64,' + Utilities.base64Encode(blob.getBytes());
    }
  }
  return null;
}
