import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import archiveService from '../services/archiveService';
import { getImageUrl } from '../services/api';

const ArchiveForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        description: '',
        featured: false
    });
    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [existingPdf, setExistingPdf] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        const fetchArchive = async () => {
            if (!isEditMode) return;
            
            try {
                setFetchingData(true);
                const res = await archiveService.getArchives();
                const archive = res.data.find(a => a._id === id);
                
                if (!archive) {
                    toast.error('Archive introuvable');
                    navigate('/archives');
                    return;
                }

                setFormData({
                    title: archive.title,
                    excerpt: archive.excerpt,
                    description: archive.description,
                    featured: archive.featured
                });
                setCoverImagePreview(archive.coverImage);
                setExistingPdf(archive.fileUrl);
            } catch (error) {
                console.error('Erreur chargement archive:', error);
                toast.error('Erreur lors du chargement');
                navigate('/archives');
            } finally {
                setFetchingData(false);
            }
        };

        fetchArchive();
    }, [id, isEditMode, navigate]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            toast.error('Veuillez sélectionner un fichier PDF');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (!formData.title.trim()) {
            toast.error('Le titre est obligatoire');
            return;
        }
        if (!formData.excerpt.trim()) {
            toast.error('La synthèse est obligatoire');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('La description est obligatoire');
            return;
        }
        if (!isEditMode && !coverImage) {
            toast.error('L\'image de couverture est obligatoire');
            return;
        }
        if (!isEditMode && !pdfFile) {
            toast.error('Le PDF est obligatoire');
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append('title', formData.title);
            data.append('excerpt', formData.excerpt);
            data.append('description', formData.description);
            data.append('featured', formData.featured);

            if (coverImage) {
                data.append('coverImage', coverImage);
            }
            if (pdfFile) {
                data.append('pdf', pdfFile);
            }

            if (isEditMode) {
                await archiveService.updateArchive(id, data);
                toast.success('Archive modifiée avec succès');
            } else {
                await archiveService.createArchive(data);
                toast.success('Archive créée avec succès');
            }

            navigate('/archives');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/archives')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditMode ? 'Modifier l\'archive' : 'Nouvelle archive'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditMode 
                            ? 'Modifiez les informations de l\'archive' 
                            : 'Créez un nouveau rapport ou document'}
                    </p>
                </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                    
                    {/* Titre */}
                    <div className="mb-6">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Titre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                            placeholder="Ex: Rapport annuel 2024"
                        />
                    </div>

                    {/* Synthèse */}
                    <div className="mb-6">
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                            Synthèse <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-500 ml-2">(max 300 caractères)</span>
                        </label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            required
                            maxLength={300}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none resize-none"
                            placeholder="Bref résumé du document..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.excerpt.length}/300 caractères
                        </p>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={8}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none resize-none"
                            placeholder="Description détaillée du document..."
                        />
                    </div>

                    {/* Image de couverture */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image de couverture {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-blue transition-colors">
                            {coverImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={coverImagePreview.startsWith('data:') ? coverImagePreview : getImageUrl(coverImagePreview)}
                                        alt="Preview"
                                        className="max-h-64 mx-auto rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCoverImage(null);
                                            setCoverImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 mb-2">Cliquez pour sélectionner une image</p>
                                    <p className="text-xs text-gray-500">JPG, PNG ou WebP (max 5MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* PDF */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fichier PDF {!isEditMode && <span className="text-red-500">*</span>}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-blue transition-colors relative">
                            {pdfFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="w-8 h-8 text-brand-blue" />
                                    <div>
                                        <p className="text-gray-900 font-medium">{pdfFile.name}</p>
                                        <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPdfFile(null)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : existingPdf ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="w-8 h-8 text-brand-blue" />
                                    <div>
                                        <p className="text-gray-900 font-medium">PDF actuel</p>
                                        <p className="text-xs text-gray-500">Sélectionnez un nouveau PDF pour remplacer</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 mb-2">Cliquez pour sélectionner un PDF</p>
                                    <p className="text-xs text-gray-500">Format PDF uniquement (max 20MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handlePdfChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Featured */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                            className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                        />
                        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                            Mettre en avant sur la page d'accueil
                        </label>
                    </div>

                </div>

                {/* Boutons d'action */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Enregistrement...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                <span>{isEditMode ? 'Modifier' : 'Créer'}</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/archives')}
                        className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ArchiveForm;