/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de colores ESANT MARIA - Basado en Dieter Rams
        'esant': {
          'black': '#000000',
          'white': '#FFFFFF',
          'gray': {
            100: '#F5F5F5',  // Fondos
            200: '#E8E8E8',  // Bordes, divisores
            400: '#9E9E9E',  // Texto secundario
            600: '#757575',  // Iconos inactivos
            800: '#424242',  // Texto principal
          },
          'red': '#DC2626',    // Primary - Notificaciones, alertas, acciones
          'green': '#25D366',  // Solo para WhatsApp
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],    // Metadata, timestamps
        'sm': ['14px', { lineHeight: '20px' }],    // Texto secundario
        'base': ['16px', { lineHeight: '24px' }],  // Texto principal
        'lg': ['18px', { lineHeight: '28px' }],    // Subtítulos
        'xl': ['20px', { lineHeight: '28px' }],    // Títulos de sección
        '2xl': ['24px', { lineHeight: '32px' }],   // Títulos principales
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'esant': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'esant-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
