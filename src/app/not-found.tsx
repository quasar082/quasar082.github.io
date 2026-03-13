export default function NotFound() {
  return (
    <html>
      <body
        style={{
          backgroundColor: '#030712',
          color: '#f0fdf4',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: [
            'linear-gradient(to right, rgba(16, 185, 129, 0.12) 1px, transparent 1px)',
            'linear-gradient(to bottom, rgba(16, 185, 129, 0.12) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '40px 40px',
        }}
      >
        <main style={{textAlign: 'center', padding: '2rem'}}>
          <p
            style={{
              fontSize: '6rem',
              fontWeight: 300,
              margin: '0 0 1rem',
              color: '#34d399',
              lineHeight: 1,
            }}
          >
            404
          </p>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 500,
              margin: '0 0 0.75rem',
            }}
          >
            Page Not Found
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: '#a3a3a3',
              margin: '0 0 2rem',
              maxWidth: '24rem',
            }}
          >
            The page you are looking for does not exist or has been moved.
          </p>
          <nav
            style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
            }}
          >
            <a
              href="/en/"
              style={{
                color: '#34d399',
                textDecoration: 'none',
                padding: '0.5rem 1.25rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.5rem',
                transition: 'background-color 150ms ease-out',
              }}
            >
              English Home
            </a>
            <a
              href="/vi/"
              style={{
                color: '#34d399',
                textDecoration: 'none',
                padding: '0.5rem 1.25rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.5rem',
                transition: 'background-color 150ms ease-out',
              }}
            >
              Trang Chu
            </a>
          </nav>
        </main>
      </body>
    </html>
  );
}
