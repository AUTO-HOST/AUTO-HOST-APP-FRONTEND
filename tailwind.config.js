    /** @type {import('tailwindcss').Config} */
    module.exports = {
      // La sección 'content' le dice a Tailwind dónde buscar las clases que usas.
      // Esto es crucial para que genere el CSS correcto.
      content: [
        "./src/**/*.{js,jsx,ts,tsx}", // Busca clases en todos los archivos JS/JSX/TS/TSX dentro de 'src'
        "./public/index.html",         // También busca en tu archivo HTML principal
      ],
      theme: {
        extend: {
          // Puedes extender el tema predeterminado de Tailwind aquí.
          // Por ejemplo, si usas una fuente específica como 'Inter'.
          fontFamily: {
            inter: ['Inter', 'sans-serif'],
          },
        },
      },
      plugins: [], // Aquí puedes añadir plugins de Tailwind si los necesitas.
    }
    
