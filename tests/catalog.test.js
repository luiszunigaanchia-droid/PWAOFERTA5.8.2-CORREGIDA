'use strict';

const assert = require('assert');
const Catalog = require('../js/catalog.js');

console.log('--- Ejecutando pruebas unitarias de PreanalyticsCatalog (PWAOFERTA5.8.2) ---');

// Test 1: getAuthTagInfo
const authHsjd = Catalog.getAuthTagInfo('hsjd');
assert.strictEqual(authHsjd.label, 'Área HSJD');
const authTodos = Catalog.getAuthTagInfo('todos_ccss');
assert.strictEqual(authTodos.label, 'Todos CCSS');
console.log('✓ Test 1: getAuthTagInfo superado');

// Test 2: isUninformativeValue
assert.strictEqual(Catalog.isUninformativeValue('No aplica'), true);
assert.strictEqual(Catalog.isUninformativeValue('N/A'), true);
assert.strictEqual(Catalog.isUninformativeValue('Sin indicaciones'), true);
assert.strictEqual(Catalog.isUninformativeValue('Ayuno de 8 horas'), false);
console.log('✓ Test 2: isUninformativeValue superado');

// Test 3: normalizeSearch y matchesQuery
const testRecord = {
  id: 'PRU-501',
  nombre: 'Troponina I de Alta Sensibilidad',
  division: 'Química Clínica',
  tipo_muestra: 'Suero / Plasma heparina',
  codigo_digitacion: 'TRP01'
};

assert.strictEqual(Catalog.matchesQuery(testRecord, 'troponina'), true);
assert.strictEqual(Catalog.matchesQuery(testRecord, 'TRP01'), true);
assert.strictEqual(Catalog.matchesQuery(testRecord, 'heparina'), true);
console.log('✓ Test 3: normalizeSearch y matchesQuery superado');

// Test 4: divisionName y tubeColor
assert.strictEqual(Catalog.divisionName('Química Clínica'), 'Química Clínica');
assert.strictEqual(Catalog.tubeColor('Plasma heparina'), '#3f8f5c');
console.log('✓ Test 4: divisionName y tubeColor superado');

// Test 5: normalizeTest
const norm = Catalog.normalizeTest({
  id: 'PRU-99',
  nombre: 'Gasometría Arterial',
  division: 'Laboratorio Emergencias',
  createdAt: 'fecha-inválida'
});
assert.strictEqual(norm.id, 'PRU-99');
assert.strictEqual(norm.nombre, 'Gasometría Arterial');
assert.strictEqual(Number.isNaN(Date.parse(norm.createdAt)), false);
console.log('✓ Test 5: normalizeTest superado');

// Test 6: protección CSV con espacios iniciales
const csv = Catalog.catalogToCsv([{ ...testRecord, nombre: '  =HYPERLINK("malicioso")' }]);
assert.ok(csv.includes('"\'  =HYPERLINK(""malicioso"")"'));
console.log('✓ Test 6: protección CSV reforzada');

// Test 7: una nueva versión oficial no debe borrar ediciones locales automáticamente
(async () => {
  let replaced = false;
  const result = await Catalog.seedIfEmpty({
    countTests: async () => 12,
    getMeta: async () => 'versión-local-anterior',
    replaceTests: async () => { replaced = true; }
  });
  assert.strictEqual(result.updateAvailable, true);
  assert.strictEqual(replaced, false, 'No debe reemplazar un catálogo local no vacío');
  console.log('✓ Test 7: conservación de ediciones locales superada');
  console.log('=== Todas las pruebas de PreanalyticsCatalog (5.8.2) pasaron exitosamente (7/7) ===');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
