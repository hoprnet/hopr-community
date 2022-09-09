import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, history } from './state/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { Route, Routes } from 'react-router'
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue, yellow } from '@mui/material/colors';

const container = document.getElementById('root')!;
const root = createRoot(container);

const theme = createTheme({
  palette: {
    primary: {
      main: blue[900],
    },
    secondary: {
      main: yellow[500],
    },
  },
  typography: {
    fontFamily: [
      'Source Code Pro,monospace',
    ].join(','),
  },
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router history={history}>
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </Router>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
