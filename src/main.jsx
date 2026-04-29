import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: 'white', minHeight: '100vh' }}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>App Crashed!</h1>
          <p>Please take a screenshot of this and send it to the developer:</p>
          <pre style={{marginTop: 10, padding: 10, background: '#eee', overflowX: 'auto', fontSize: '12px'}}>
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
