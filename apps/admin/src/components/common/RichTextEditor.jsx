// ===========================================
// ÉDITEUR DE TEXTE RICHE (TIPTAP)
// ===========================================

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import {
    Bold, Italic, Strikethrough,
    Heading2, Heading3, List, ListOrdered,
    Quote, Code, Link as LinkIcon, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Undo, Redo, Minus, RemoveFormatting, Underline as UnderlineIcon
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Écrivez votre contenu ici...' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ 
                heading: false 
            }),
            Heading.configure({ levels: [2, 3] }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Image.configure({ inline: false, allowBase64: false }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-3',
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL du lien', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    // Upload d'image depuis l'explorateur de fichiers
    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg, image/webp';
        
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            // Vérifier la taille (4 Mo max)
            if (file.size > 4 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 4 Mo');
                return;
            }

            try {
                // Créer FormData
                const formData = new FormData();
                formData.append('image', file);

                // Upload vers le backend
                const response = await api.post('/upload/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    // Construire l'URL complète
                    const imageUrl = response.data.url.startsWith('http') 
                        ? response.data.url 
                        : `http://localhost:5000${response.data.url}`;
                    
                    // Insérer l'image dans l'éditeur
                    editor.chain().focus().setImage({ src: imageUrl }).run();
                    toast.success('Image ajoutée');
                }
            } catch (err) {
                console.error('Erreur upload:', err);
                toast.error('Erreur lors de l\'upload de l\'image');
            }
        };

        input.click();
    };

    const addDivider = () => {
        editor.chain().focus().insertContent({ type: 'horizontalRule' }).run();
    };

    const buttons = [
        { icon: <Undo className="w-4 h-4" />, onClick: () => editor.chain().focus().undo().run(), isActive: false, title: 'Annuler' },
        { icon: <Redo className="w-4 h-4" />, onClick: () => editor.chain().focus().redo().run(), isActive: false, title: 'Rétablir' },
        { type: 'divider' },
        { icon: <Heading2 className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), title: 'Titre 2' },
        { icon: <Heading3 className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }), title: 'Titre 3' },
        { type: 'divider' },
        { icon: <Bold className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), title: 'Gras' },
        { icon: <Italic className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), title: 'Italique' },
        { icon: <UnderlineIcon className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline'), title: 'Souligné' },
        { icon: <Strikethrough className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), title: 'Barré' },
        { type: 'divider' },
        { icon: <List className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), title: 'Liste à puces' },
        { icon: <ListOrdered className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), title: 'Liste numérotée' },
        { icon: <Quote className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), title: 'Citation' },
        { icon: <Code className="w-4 h-4" />, onClick: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock'), title: 'Bloc de code' },
        { type: 'divider' },
        { icon: <AlignLeft className="w-4 h-4" />, onClick: () => editor.chain().focus().setTextAlign('left').run(), isActive: editor.isActive({ textAlign: 'left' }), title: 'Aligner à gauche' },
        { icon: <AlignCenter className="w-4 h-4" />, onClick: () => editor.chain().focus().setTextAlign('center').run(), isActive: editor.isActive({ textAlign: 'center' }), title: 'Centrer' },
        { icon: <AlignRight className="w-4 h-4" />, onClick: () => editor.chain().focus().setTextAlign('right').run(), isActive: editor.isActive({ textAlign: 'right' }), title: 'Aligner à droite' },
        { icon: <AlignJustify className="w-4 h-4" />, onClick: () => editor.chain().focus().setTextAlign('justify').run(), isActive: editor.isActive({ textAlign: 'justify' }), title: 'Justifier' },
        { type: 'divider' },
        { icon: <LinkIcon className="w-4 h-4" />, onClick: setLink, isActive: editor.isActive('link'), title: 'Insérer un lien' },
        { icon: <ImageIcon className="w-4 h-4" />, onClick: addImage, isActive: false, title: 'Insérer une image' },
        { icon: <Minus className="w-4 h-4" />, onClick: addDivider, isActive: false, title: 'Séparateur' },
        { type: 'divider' },
        { icon: <RemoveFormatting className="w-4 h-4" />, onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), isActive: false, title: 'Effacer le formatage' },
    ];

    return (
        <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-transparent transition-all">
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                {buttons.map((btn, index) => {
                    if (btn.type === 'divider') {
                        return <div key={index} className="w-px bg-gray-300 mx-1 self-stretch" />;
                    }
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={btn.onClick}
                            title={btn.title}
                            className={`p-2 rounded-lg transition-colors ${btn.isActive ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            {btn.icon}
                        </button>
                    );
                })}
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;