tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#165DFF',
                secondary: '#00B42A',
                neutral: {
                    100: '#F5F7FA',
                    200: '#E4E6EB',
                    300: '#C9CDD4',
                    400: '#86909C',
                    500: '#4E5969',
                    600: '#272E3B',
                    700: '#1D2129',
                }
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
            },
            boxShadow: {
                'custom': '0 4px 20px rgba(0, 0, 0, 0.08)',
                'custom-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
            }
        },
    }
}