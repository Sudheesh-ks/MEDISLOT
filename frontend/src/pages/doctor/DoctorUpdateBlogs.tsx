import React, { useEffect, useState } from 'react';
import { getDoctorBlogByIdAPI, updateDoctorBlogAPI } from '../../services/doctorServices';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';

// Lexical imports
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import Toolbar from '../../components/common/Toolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode } from 'lexical';

function LoadContentPlugin({ initialHTML }: { initialHTML: string }) {
  const [editor] = useLexicalComposerContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!initialHTML || loaded) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHTML, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      const root = $getRoot();
      root.clear();

      if (nodes.length === 1 && nodes[0].getType() === 'paragraph') {
        root.append(nodes[0]);
      } else {
        const paragraph = $createParagraphNode();
        paragraph.append(...nodes);
        root.append(paragraph);
      }
    });

    setLoaded(true);
  }, [editor, initialHTML, loaded]);

  return null;
}

const DoctorEditBlogPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [visibility, setVisibility] = useState('public');
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');

  // Lexical config
  const editorConfig = {
    namespace: 'DoctorBlogEditor',
    theme: {
      paragraph: 'mb-2',
    },
    onError(error: any) {
      console.error(error);
    },
  };

  // Fetch existing blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await getDoctorBlogByIdAPI(id!);
        const blog = data.blog;
        if (blog) {
          setTitle(blog.title || '');
          setSummary(blog.summary || '');
          setCategory(blog.category || '');
          setReadTime(blog.readTime || '');
          setTags(blog.tags || []);
          setPreview(blog.image || '');
          setVisibility(blog.visibility || 'public');
          setInitialContent(blog.content || '');
          //   setContent(blog.content || '');
        }
      } catch (error) {
        showErrorToast(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUpdate = async () => {
    if (!title || !summary || !category || !content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();

      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('category', category);
      formData.append('readTime', readTime);
      formData.append('content', content);
      if (image) formData.append('image', image);
      formData.append('tags', JSON.stringify(tags));
      formData.append('visibility', visibility);

      const { data } = await updateDoctorBlogAPI(id!, formData);

      if (data.success) {
        toast.success('Blog updated successfully');
        navigate('/doctor/blogs');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading blog...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Edit Article
            </h1>
            <p className="text-slate-400 mt-2">Update your article details and content</p>
          </div>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            {saving ? 'Saving...' : 'Update Article'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Article Header */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-green-400">Article Details</h2>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-slate-300">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-500"
              />
            </div>

            {/* Summary */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-slate-300">
                Article Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a compelling summary..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-500 resize-none"
              />
            </div>

            {/* Category and Read Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="digital-health">Digital Health</option>
                  <option value="ai-medicine">AI in Medicine</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="oncology">Oncology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="surgery">Surgery</option>
                  <option value="research">Medical Research</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">
                  Estimated Read Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g., 8 min read"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-green-400">Featured Image</h2>
            <label
              htmlFor="file-upload"
              className="cursor-pointer border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-slate-600 transition-colors block"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
                📷
              </div>
              <p className="text-slate-300 mb-2">Click to upload or drag and drop</p>
              <p className="text-slate-500 text-sm">PNG, JPG, GIF up to 10MB</p>
              <div className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-block">
                Choose File
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-6 w-64 h-40 object-cover rounded-lg border border-slate-700"
              />
            )}
          </div>

          {/* Content Editor */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-green-400">Article Content</h2>

            <LexicalComposer initialConfig={editorConfig}>
              <Toolbar />
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-[200px] p-4 bg-slate-800 rounded-lg" />
                }
                placeholder={<div className="text-slate-500">Enter blog content...</div>}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <OnChangePlugin
                onChange={(editorState, editor) => {
                  editorState.read(() => {
                    const htmlString = $generateHtmlFromNodes(editor);
                    setContent(htmlString);
                  });
                }}
              />
              <LoadContentPlugin initialHTML={initialContent} />
            </LexicalComposer>
          </div>

          {/* Tags */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-green-400">Tags</h2>
            <div className="mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-slate-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30 flex items-center gap-2"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-green-300">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Publication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Visibility</span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                  <option value="members">members</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DoctorEditBlogPage;
