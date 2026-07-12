import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SchemaMarkup from './components/SchemaMarkup';

// Layouts
import Header from './components/layouts/Header.jsx';
import Footer from './components/layouts/Footer.jsx';

// Pages
import Accueil from './pages/Accueil.jsx';
import Actualites from './pages/Actualites.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import Activites from './pages/Activites.jsx';
import Opportunites from './pages/Opportunites.jsx';
import OpportunityDetail from './pages/OpportunityDetail.jsx';
import Gallery from './pages/Gallery';
import Archives from './pages/Archives.jsx';
import ArchiveDetail from './pages/ArchiveDetail.jsx';
import Contact from './pages/Contact.jsx';
import Error404 from './pages/Error404.jsx';

// ===========================================
// LAYOUT PRINCIPAL (avec Header et Footer)
// ===========================================
const MainLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
};

// ===========================================
// APPLICATION PRINCIPALE
// ===========================================
function App() {
    return (
        <HelmetProvider>
            {/* Schema.org pour l'organisation */}
            <SchemaMarkup type="organization" />
            <BrowserRouter>
                <Routes>
                    {/* Routes avec Header et Footer */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Accueil />} />
                        <Route path="/activites" element={<Activites />} />
                        <Route path="/actualites" element={<Actualites />} />
                        <Route path="/actualites/:slug" element={<ArticleDetail />} />
                        <Route path="/opportunites" element={<Opportunites />} />
                        <Route path="/opportunites/:id" element={<OpportunityDetail />} />
                        <Route path="/galerie" element={<Gallery />} />
                        <Route path="/archives" element={<Archives />} />
                        <Route path="/archives/:slug" element={<ArchiveDetail />} />
                        <Route path="/contact" element={<Contact />} />
                    </Route>

                    {/* Route 404 (sans Header ni Footer) */}
                    <Route path="*" element={<Error404 />} />
                </Routes>
            </BrowserRouter>
        </HelmetProvider>
    );
}

export default App;