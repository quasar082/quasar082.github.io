export default function NotFound() {
  return (
    <html>
      <body
        style={{
          backgroundColor: '#FAFAF8',
          color: '#1A1A1A',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <main style={{textAlign: 'center', padding: '2rem'}}>
          <p
            style={{
              fontSize: '6rem',
              fontWeight: 500,
              margin: '0 0 1rem',
              color: '#888580',
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
              color: '#666460',
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
                color: '#444444',
                textDecoration: 'none',
                padding: '0.5rem 1.25rem',
                border: '1px solid rgba(136, 133, 128, 0.3)',
                borderRadius: '0.5rem',
                transition: 'background-color 150ms ease-out',
              }}
            >
              English Home
            </a>
            <a
              href="/vi/"
              style={{
                color: '#444444',
                textDecoration: 'none',
                padding: '0.5rem 1.25rem',
                border: '1px solid rgba(136, 133, 128, 0.3)',
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
