'use client';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';

  console.error(error);

  return (
    <html lang="en">
      <head>
        <style>{`
          body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f8f8f8;
          }

          .error-container {
            width: 100%;
            max-width: 600px;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
          }

          .error-header {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .error-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: #ff0000;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 600;
          }

          .error-message {
            margin-top: 10px;
            line-height: 1.5;
          }

          .error-summary {
            margin-top: 15px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
          }

          details {
            margin-top: 15px;
          }

          summary {
            cursor: pointer;
            font-weight: 500;
          }

          .error-stack {
            font-family: monospace;
            font-size: 12px;
            margin-top: 10px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
            overflow: auto;
            max-height: 200px;
          }

          code {
            background: #eee;
            padding: 2px 4px;
            border-radius: 4px;
          }
        `}</style>
      </head>

      <body>
        <div className="error-container">
          <div className="error-header">
            <div className="error-icon">!</div>
            <h1>Error</h1>
          </div>

          <p className="error-message">
            An application error occurred while loading{' '}
            <code>{pathname || '/'}</code>
          </p>

          <div className="error-summary">
            {error.message || 'Unknown error'}
          </div>

          {error.stack && (
            <details>
              <summary>View Stack Trace</summary>
              <pre className="error-stack">{error.stack}</pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}