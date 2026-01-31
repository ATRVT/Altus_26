function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('ALTUS - Registro Educativo y Terapéutico')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

/**
 * Fetches data for dropdowns from Sheets.
 * Returns an object: { students: [], educational: [], therapeutic: [] }
 */
function getData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get Students
  const studentsSheet = ss.getSheetByName('Estudiantes');
  let students = [];
  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    students = studentsSheet.getRange(2, 1, studentsSheet.getLastRow() - 1, 1).getValues().flat().filter(String);
  }

  // Get Educational Base
  const eduSheet = ss.getSheetByName('Base_Educativa');
  // Grado (A), Materia (B), OCP (C)
  let educational = [];
  if (eduSheet && eduSheet.getLastRow() > 1) {
    const eduData = eduSheet.getRange(2, 1, eduSheet.getLastRow() - 1, 3).getValues().filter(row => row[0]);
    educational = eduData.map(row => ({
      grado: row[0],
      materia: row[1],
      ocp: row[2]
    }));
  }

  // Get Therapeutic Base - Try common variations
  let theraSheet = ss.getSheetByName('Base_Terapeutica');
  if (!theraSheet) theraSheet = ss.getSheetByName('Base Terapeutica');
  if (!theraSheet) theraSheet = ss.getSheetByName('Base_Terapéutica');
  
  let therapeutic = [];
  if (theraSheet && theraSheet.getLastRow() > 1) {
    // Get all values from Col A (Row 2 to End)
    // Using flat().filter(String) to remove empty rows
    therapeutic = theraSheet.getRange(2, 1, theraSheet.getLastRow() - 1, 1)
                  .getValues().flat()
                  .filter(cell => cell !== "" && cell !== null);
  }

  return {
    students: students,
    educational: educational,
    therapeutic: therapeutic
  };
}

/**
 * Saves a session (array of records) to the 'Registros' sheet.
 */
function saveSession(records) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registros');
  if (!sheet) throw new Error('Hoja "Registros" no encontrada.');

  // "Registros": A: Marca Temporal, B: ID_Sesion, C: Fecha_Sesion, D: Estudiante, 
  // E: Tipo_Registro, F: Grado_Nivel, G: Materia_Programa, H: OCP, I: UAC, 
  // J: UAI, K: Nivel_Ayuda, L: Reforzador, M: Programa_Reforzamiento, N: Profesional.

  const timestamp = new Date();
  const rows = records.map(r => [
    timestamp,
    r.idSesion,
    r.fechaSesion, // Should be passed as string or date object
    r.estudiante,
    r.tipoRegistro, // 'Educativo' or 'Terapeutico'
    r.grado || '',
    r.materia || '', // Or Program Name if therapeutic? Requirement says G is Materia_Programa
    r.ocp || '',
    r.uac,
    r.uai,
    r.nivelAyuda,
    r.reforzador,
    r.programaReforzamiento,
    Session.getActiveUser().getEmail() // Profesional
  ]);

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return { success: true, message: 'Sesión guardada exitosamente.' };
}

/**
 * Gets data for the dashboard.
 */
function getDashboardData(studentName, startDateStr, endDateStr, program) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = ss.getSheetByName('Registros');
  const recSheet = ss.getSheetByName('Recomendaciones');
  
  if (!regSheet) return { records: [], recommendations: [] };

  const data = regSheet.getDataRange().getValues();
  const headers = data.shift(); // Remove headers
  
  // Filter
  let filtered = data.filter(row => {
    // D is Student (index 3)
    if (studentName && row[3] !== studentName) return false;
    
    // G is Materia/Programa (index 6)
    if (program && row[6] !== program) return false;
    
    // Date Filtering (C is Fecha_Sesion index 2) - assuming string match or simple compare
    // Ideally user inputs ISO strings, sheet has strings or date objects.
    // For specific date filtering, we'd convert these.
    // Simplifying for this demo: if start/end provided, we assume strict greater/less check
    if (startDateStr && endDateStr) {
       const rowDate = new Date(row[2]);
       const start = new Date(startDateStr);
       const end = new Date(endDateStr);
       if (rowDate < start || rowDate > end) return false;
    }
    
    return true;
  });
  
  const recommendations = recSheet ? recSheet.getDataRange().getValues().slice(1) // skip header
      .filter(row => row[1] === studentName) : [];

  return {
    records: filtered, // Return all matching filter
    recommendations: recommendations
  };
}

/**
 * Saves a recommendation.
 */
function saveRecommendation(student, recommendation) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Recomendaciones');
  if (!sheet) return { success: false, message: 'Hoja "Recomendaciones" no encontrada' };
  
  sheet.appendRow([new Date(), student, recommendation]);
  return { success: true };
}
