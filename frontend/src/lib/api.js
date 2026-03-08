export const getApiUrl = (path) => {
    const isProduction = import.meta.env.PROD;
    // In production, you might set a VITE_BACKEND_URL in your hosting platform (like Vercel).
    // If not set, it defaults to the relative '/api' which works if you use rewrites.
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';

    // In dev, Vite proxy handles '/api' -> 'http://localhost:5000'
    // So for both dev and production, if baseline is empty, '/api/...' works via proxy or relative paths.
    return `${baseUrl}${path}`;
};
