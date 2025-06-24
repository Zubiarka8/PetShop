// Inserta automáticamente el año actual en el elemento con id="year"
document.getElementById("year").textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Previene el envío hasta validar

    // Obtener valores
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const password = document.getElementById('password').value;
    const confirmarPassword = document.getElementById('confirmarPassword').value;

    // Validaciones
    if (!nombre || !correo || !telefono || !password || !confirmarPassword) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      alert('Introduce un correo electrónico válido.');
      return;
    }

    const telefonoRegex = /^\d{9,15}$/;
    if (!telefonoRegex.test(telefono)) {
      alert('Introduce un número de teléfono válido (solo dígitos, mínimo 9).');
      return;
    }

    if (password !== confirmarPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Si todo es válido
    alert('Registro exitoso 🎉');
    form.reset(); // Limpia el formulario si quieres
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('form2Example11').value.trim();
    const password = document.getElementById('form2Example22').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (!emailRegex.test(email)) {
      alert('Por favor, introduce un correo electrónico válido.');
      return;
    }

    // Simulación de login exitoso
    alert('Inicio de sesión exitoso ✅');
    loginForm.reset();
  });
});

