const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://lsc-website.onrender.com'  // URL de production
    : 'http://localhost:10000'            // URL de développement
};

export default config; 