# ¿Por qué no conecta con GitHub automáticamente?

Imagina que GitHub es como entrar a tu cuenta bancaria o a tu correo. Para guardar archivos allí, GitHub necesita asegurarse de que **realmente eres tú**.

### El Problema
Yo soy un asistente virtual. Puedo escribir código y organizar archivos en tu carpeta, pero **no tengo tu contraseña ni tus llaves de seguridad** para entrar a tu cuenta de GitHub.

Cuando intento enviar los archivos (el comando `git push`), GitHub me detiene y pregunta: *"¿Quién eres? Dame tu contraseña"*. Como yo no la tengo, el proceso se detiene.

### La Solución
Tú, como dueño de la cuenta, debes "abrir la puerta" una vez.

1.  Abre la aplicación **Terminal** en tu Mac.
2.  Escribe (o pega) este comando y pulsa Enter:
    ```bash
    cd "/Users/raulmaroto/Documents/01 Proyectos 🎯& ⏰/AP_reg_altus26" && git push -u origin main
    ```
3.  GitHub te pedirá tus credenciales (a veces se abre una ventanita del navegador para que inicies sesión).
4.  Una vez lo hagas, los archivos subirán.

### Nota Importante
Esto **solo sirve para guardar una copia de seguridad** de tu código.
**No afecta al funcionamiento de tu aplicación ALTUS**. Para que la app funcione, lo único que importa es que copies los códigos en el editor de Google Apps Script, como has estado haciendo.
