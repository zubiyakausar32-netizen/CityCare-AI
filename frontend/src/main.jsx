import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import FeaturesPage from './FeaturesPage';
import ReportPage from './ReportPage';
import CleanerPublicSpacesPage from './CleanerPublicSpacesPage';
import SdgTopicPage from './SdgTopicPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<App dashboardOnly />} />
        <Route path="/insights" element={<App dashboardOnly insightsOnly />} />
        <Route path="/sdg-11" element={<App dashboardOnly sdgOnly />} />
        <Route path="/sdg-11/cleaner-public-spaces" element={<CleanerPublicSpacesPage />} />
        <Route path="/sdg-11/:topic" element={<SdgTopicPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
