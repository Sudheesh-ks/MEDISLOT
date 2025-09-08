import React, { useState, useRef } from 'react';
import { createDoctorBlogAPI } from '../../services/doctorServices';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import Toolbar from '../../components/common/Toolbar';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useNavigate } from 'react-router-dom';

const DoctorAddBlogPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);

  const editorRef = useRef<any>(null);
  const [content, setContent] = useState('');

  const editorConfig = {
    namespace: 'DoctorBlogEditor',
    theme: {
      paragraph: 'mb-2',
    },
    onError(error: any) {
      console.error(error);
    },
    editorRef,
  };

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

  const handlePublish = async () => {
    if (!title || !summary || !category || !content) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('category', category);
      formData.append('readTime', readTime);
      formData.append('content', content);
      if (image) formData.append('image', image);
      formData.append('tags', JSON.stringify(tags));
      formData.append('visibility', visibility);

      const { data } = await createDoctorBlogAPI(formData);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }

      setTitle('');
      setSummary('');
      setCategory('');
      setReadTime('');
      setTags([]);
      setImage(null);
      setContent('');
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Create New Article
            </h1>
            <p className="text-slate-400 mt-2">
              Share your medical expertise with the healthcare community
            </p>
          </div>
          <button
            onClick={() => navigate('/doctor/blogs')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            My Blogs
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            {loading ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Article Header */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-blue-400">Article Details</h2>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-slate-300">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
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
                placeholder="Write a compelling summary of your article..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 resize-none"
              />
            </div>

            {/* Category and Read Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-blue-400">Featured Image</h2>
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
            {image && (
              <img
                src={preview}
                alt="preview"
                className="mt-6 w-64 h-40 object-cover rounded-lg border border-slate-700"
              />
            )}
          </div>

          {/* Content Editor */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-blue-400">Article Content</h2>
            <LexicalComposer initialConfig={editorConfig}>
              <Toolbar />
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="min-h-[200px] w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                }
                placeholder={
                  <div className="text-slate-500 px-2 py-1">Start writing your article...</div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <OnChangePlugin
                onChange={(editorState, editor) => {
                  editorState.read(() => {
                    const html = $generateHtmlFromNodes(editor, null);
                    setContent(html);
                  });
                }}
              />
            </LexicalComposer>

            {/* Tips */}
            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="font-medium text-cyan-400 mb-2">💡 Writing Tips</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Use clear headings (H2, H3) to structure your content</li>
                <li>• Include evidence-based information and cite sources</li>
                <li>• Write in a professional yet accessible tone</li>
                <li>• Use paragraphs to break up long sections</li>
              </ul>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-blue-400">Tags</h2>
            <div className="mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter to add)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/30 flex items-center gap-2"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-300">
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
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Publication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Visibility</span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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

export default DoctorAddBlogPage;
