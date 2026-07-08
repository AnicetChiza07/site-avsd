import './App.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'; // 1. Ajout de Outlet
import Header from './components/layouts/Header.jsx';
import Footer from './components/layouts/Footer.jsx';

import Accueil from './pages/Accueil.jsx';
import Actualites from './pages/Actualites.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import Activites from './pages/Activites.jsx';
import Opportunites from './pages/Opportunites.jsx';
import Contact from './pages/Contact.jsx';
import Error404 from './pages/Error404.jsx';
import OpportunityDetail from './pages/OpportunityDetail.jsx';
import Gallery from './pages/Gallery';

// Composant Layout qui contient le Header et le Footer
const MainLayout = () => {
    return (
        <>
            <Header />
            <Outlet /> {/* Ici s'afficheront les pages enfants */}
            <Footer />
        </>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 2. Routes avec Header et Footer */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Accueil />} />
                    <Route path="/activites" element={<Activites />} />
                    <Route path="/actualites" element={<Actualites />} />
                    <Route path="/actualites/:slug" element={<ArticleDetail />} />
                    <Route path="/opportunites" element={<Opportunites />} />
                    <Route path="/opportunites/:id" element={<OpportunityDetail />} />
                    <Route path="/galerie" element={<Gallery />} />
                    <Route path="/contact" element={<Contact />} />
                </Route>

                {/* 3. Route 404 SANS Header ni Footer (isolée) */}
                <Route path="*" element={<Error404 />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;