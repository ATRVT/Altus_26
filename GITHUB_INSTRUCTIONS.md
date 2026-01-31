# Cómo subir tu proyecto a GitHub

He inicializado el repositorio localmente y guardado ("comiteado") todos tus archivos. Para subirlo a la nube (GitHub), sigue estos pasos:

1.  **Crea el Repositorio en GitHub**:
    *   Entra a [github.com/new](https://github.com/new).
    *   Ponle un nombre (ej: `altus-spa`).
    *   Déjalo en "Público" o "Privado" según prefieras.
    *   **NO** marques ninguna casilla de "Initialize this repository with" (ni README, ni .gitignore). Queremos un repositorio vacío.
    *   Dale a "Create repository".

2.  **Conecta tu ordenador**:
    *   Verás una pantalla con instrucciones. Copia las líneas que aparecen bajo **"…or push an existing repository from the command line"**.
    *   Se verán algo así:
        ```bash
        git remote add origin https://github.com/TU_USUARIO/altus-spa.git
        git branch -M main
        git push -u origin main
        ```

3.  **Ejecuta los comandos**:
    *   Abre tu terminal en esta carpeta (o pídeme que los ejecute yo si me das la URL del repo que acabas de crear).

¡Y listo! Tu código estará en GitHub.
