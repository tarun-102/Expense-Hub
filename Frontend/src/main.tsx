import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { store } from '../src/app/store.ts';
import { Provider } from 'react-redux';
import "./styles/global.css"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Provider store={store}>
            <App />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="colored"
            />
        </Provider>

  </StrictMode>,
)
