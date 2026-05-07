// ═══════════════════════════════════════════════════════════
// ARQLUZ ENTREGAS — DRIVE BACKEND v3
// Pasta raiz única via ScriptProperties
// Relatório PDF automático por entrega
// ═══════════════════════════════════════════════════════════

// ── PASTA RAIZ (salva ID para nunca duplicar) ────────────
function getRootFolder() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('ARQLUZ_ROOT_ID');
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); } catch(e) {}
  }
  // Procura existente
  const it = DriveApp.getFoldersByName('Arqluz Entregas');
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder('Arqluz Entregas');
  props.setProperty('ARQLUZ_ROOT_ID', folder.getId());
  return folder;
}

// ── PASTA DO CLIENTE (raiz / CLIENTE — COD XXXXX) ────────
function getClientFolder(cliente, codCli) {
  const root = getRootFolder();
  const nome = cliente.toUpperCase() + ' — COD ' + codCli;
  const it   = root.getFoldersByName(nome);
  return it.hasNext() ? it.next() : root.createFolder(nome);
}

// ── PASTA DO MÊS (cliente / YYYY-MM) ─────────────────────
function getMesFolder(clientFolder, data) {
  const mes = data.substring(0, 7);
  const it  = clientFolder.getFoldersByName(mes);
  return it.hasNext() ? it.next() : clientFolder.createFolder(mes);
}

// ── doPost: recebe arquivos individuais ──────────────────
function doPost(e) {
  try {
    const dados    = JSON.parse(e.postData.contents);
    const tipo     = dados.tipo     || 'arquivo';
    const base64   = dados.base64;
    const cliente  = dados.cliente  || 'SEM-NOME';
    const codCli   = dados.codCli   || 'SEM-COD';
    const pedido   = dados.pedido   || '';
    const data     = dados.data     || hoje();
    const mimeType = dados.mimeType || 'image/png';

    const pastaCliente = getClientFolder(cliente, codCli);
    const pastaMes     = getMesFolder(pastaCliente, data);

    const ext = mimeType.includes('pdf')  ? '.pdf'
              : mimeType.includes('jpeg') || mimeType.includes('jpg') ? '.jpg'
              : '.png';
    const nrPed    = pedido ? '_ped' + pedido : '';
    const filename = tipo + nrPed + '_' + data + ext;

    const bytes   = Utilities.base64Decode(base64);
    const blob    = Utilities.newBlob(bytes, mimeType, filename);
    const arquivo = pastaMes.createFile(blob);
    arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = arquivo.getId();
    const url    = 'https://drive.google.com/uc?id=' + fileId + '&export=view';

    return resp({ success: true, url: url, fileId: fileId, filename: filename });

  } catch(err) {
    Logger.log('ERRO: ' + err.toString());
    return resp({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  return resp({ status: 'online' });
}

function hoje() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function obterOuCriar(nome, pai) {
  const root   = pai || DriveApp;
  const pastas = root.getFoldersByName(nome);
  if (pastas.hasNext()) return pastas.next();
  return root.createFolder(nome);
}

function resp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
