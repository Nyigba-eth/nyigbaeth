'use client';

// Development warning filter
if (process.env.NODE_ENV === 'development') {
  // Store original console methods
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Filter development warnings
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Skip specific development warnings
    if (
      message.includes('React DevTools') ||
      message.includes('Lit is in dev mode') ||
      message.includes('reactive-element.js') ||
      message.includes('Not recommended for production')
    ) {
      return;
    }
    
    // Show other warnings
    originalWarn.apply(console, args);
  };

  console.log = (...args) => {
    const message = args.join(' ');
    
    // Skip React DevTools suggestions in console
    if (message.includes('Download the React DevTools')) {
      return;
    }
    
    originalLog.apply(console, args);
  };
}

export const initDevWarningFilter = () => {
  // This function exists for explicit initialization if needed
  if (process.env.NODE_ENV === 'development') {
    console.info('🔧 Development warning filter initialized');
  }
};
