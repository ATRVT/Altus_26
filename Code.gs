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
 * Simple connection test
 */
function testConnection() {
  return "OK";
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
  
  // Normalize inputs
  const targetStudent = studentName ? String(studentName).trim() : "";
  const targetProgram = program ? String(program).trim() : "";
  
  // Debug: Get all students present in the data before filtering
  const uniqueStudents = [...new Set(data.map(r => String(r[3]).trim()))];

  // Filter
  let filtered = data.filter(row => {
    // D is Student (index 3)
    if (targetStudent) {
      const rowStudent = String(row[3]).trim();
      if (rowStudent !== targetStudent) return false;
    }
    
    // G is Materia/Programa (index 6)
    if (targetProgram) {
      const rowProgram = String(row[6]).trim();
      if (rowProgram !== targetProgram) return false;
    }
    
    // Date Filtering (C is Fecha_Sesion index 2)
    // Row val could be Date object or String
    let rowDate = row[2];
    if (typeof rowDate === 'string') {
      // Try parsing YYYY-MM-DD or standard formats
      // If it is '30/01/2026', Date.parse might fail in some locales or assume MM/DD.
      // We assume YYYY-MM-DD from the form save.
      rowDate = new Date(rowDate);
    } 
    // If it's still not a date object (e.g. valid date string converted), ensure it is.
    if (!(rowDate instanceof Date) || isNaN(rowDate)) return false; // Invalid date in row, skip or keep? Skip to be safe.

    // Strip time for strict day comparison
    rowDate.setHours(0,0,0,0);

    if (startDateStr) {
       const start = new Date(startDateStr); // Expecting YYYY-MM-DD
       start.setHours(0,0,0,0); 
       // Fix timezone offset issues by treating as simple string comparison if possible? 
       // Safer to use timestamps
       if (rowDate.getTime() < start.getTime()) return false;
    }

    if (endDateStr) {
       const end = new Date(endDateStr);
       end.setHours(0,0,0,0);
       if (rowDate.getTime() > end.getTime()) return false;
    }
    
    return true;
  });
  
  // Sort by Date (oldest first) for Chart
  filtered.sort((a, b) => {
    const dA = new Date(a[2]);
    const dB = new Date(b[2]);
    return dA - dB;
  });

  const recommendations = recSheet ? recSheet.getDataRange().getValues().slice(1) // skip header
      .filter(row => String(row[1]).trim() === targetStudent) : [];
      
  // Reverse recommendations to show newest first
  recommendations.sort((a, b) => new Date(b[0]) - new Date(a[0]));

  return {
    records: filtered, 
    recommendations: recommendations,
    totalRows: data.length, // Total records in sheet before filter
    filterStudent: targetStudent,
    debugStudents: uniqueStudents
  };
}

/**
 * Saves a recommendation.
 */
function saveRecommendation(student, recommendation, supervisor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Recomendaciones');
  if (!sheet) return { success: false, message: 'Hoja "Recomendaciones" no encontrada' };
  
  // Columns: A: Fecha, B: Estudiante, C: Supervisora, D: Recomendacion
  sheet.appendRow([
    new Date(), 
    student, 
    supervisor || Session.getActiveUser().getEmail(), 
    recommendation
  ]);
  return { success: true };
}
