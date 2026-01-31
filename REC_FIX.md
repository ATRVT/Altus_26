# Corrección Guardado de Recomendaciones

### Problema
El texto de la recomendación se guardaba en la columna C ("Supervisora") en lugar de la columna D, y faltaba el campo para introducir el nombre de la supervisora.

### Solución
1.  **`index.html`**: Se ha añadido un campo `input` para el nombre de la supervisora.
2.  **`js.html`**: Se captura el valor de este campo y se valida antes de enviar.
3.  **`Code.gs`**: Se ha corregido la función `saveRecommendation` para guardar los datos en el orden exacto: `[Fecha, Estudiante, Supervisora, Texto]`.

### Instrucciones
Actualiza `Code.gs`, `index.html` y `js.html`.
