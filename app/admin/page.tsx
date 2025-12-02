"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { Trash2, Edit, FileText, Users, GraduationCap, Save, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>({ teachers: [], students: [], pages: [], packages: [] });
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(true);

  // Page Editor State
  const [editingPage, setEditingPage] = useState({ slug: '', title: '', content: '' });

  // Fetch Data
  const refreshData = () => {
    fetch('/api/admin/general')
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshData();
  }, []);

  // DELETE Function
  const handleDelete = async (id: string, type: 'teacher' | 'student') => {
    if(!confirm("Are you sure? This will delete all their bookings too.")) return;
    
    await fetch('/api/admin/general', {
      method: 'DELETE',
      body: JSON.stringify({ id, type }),
      headers: { 'Content-Type': 'application/json' }
    });
    refreshData();
  };

  // SAVE PAGE Function
  const handleSavePage = async () => {
    await fetch('/api/admin/general', {
      method: 'POST',
      body: JSON.stringify(editingPage),
      headers: { 'Content-Type': 'application/json' }
    });
    alert("Page Saved!");
    setEditingPage({ slug: '', title: '', content: '' }); // Reset
    refreshData();
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Super Admin Control</h1>

        {/* TABS */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('teachers')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'teachers' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Teachers</button>
          <button onClick={() => setActiveTab('students')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Students</button>
          <button onClick={() => setActiveTab('pages')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'pages' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Site Pages</button>
        </div>

        {/* --- TEACHERS TAB --- */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.teachers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{t.name}</td>
                    <td className="p-4">{t.subject}</td>
                    <td className="p-4 text-sm text-gray-500">{t.email}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(t.id, 'teacher')} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- STUDENTS TAB --- */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{s.name}</td>
                    <td className="p-4 text-sm text-gray-500">{s.email}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(s.id, 'student')} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PAGES (CMS) TAB --- */}
        {activeTab === 'pages' && (
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Page List */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
              <h3 className="font-bold mb-4">Existing Pages</h3>
              <ul className="space-y-2">
                {data.pages.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">{p.title}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingPage(p)} className="text-blue-500"><Edit size={16}/></button>
                      <a href={`/${p.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600"><FileText size={16}/></a>
                    </div>
                  </li>
                ))}
                {data.pages.length === 0 && <p className="text-gray-400 text-sm">No pages created yet.</p>}
              </ul>
              <button 
                onClick={() => setEditingPage({ slug: '', title: '', content: '' })}
                className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 py-2 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
              >
                <Plus size={16} /> Create New Page
              </button>
            </div>

            {/* Page Editor */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-6 text-xl">{editingPage.slug ? 'Edit Page' : 'Create New Page'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Page Title</label>
                  <input 
                    className="w-full border p-2 rounded-lg" 
                    placeholder="e.g. About Us"
                    value={editingPage.title}
                    onChange={e => setEditingPage({...editingPage, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL Slug (e.g. about-us)</label>
                  <input 
                    className="w-full border p-2 rounded-lg bg-gray-50" 
                    placeholder="e.g. about-us"
                    value={editingPage.slug}
                    onChange={e => setEditingPage({...editingPage, slug: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content (HTML allowed)</label>
                  <textarea 
                    className="w-full border p-2 rounded-lg h-64 font-mono text-sm" 
                    placeholder="<p>Write your content here...</p>"
                    value={editingPage.content}
                    onChange={e => setEditingPage({...editingPage, content: e.target.value})}
                  />
                  <p className="text-xs text-gray-400 mt-1">Tip: You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;.</p>
                </div>
                
                <button 
                  onClick={handleSavePage}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2"
                >
                  <Save size={18} /> Save Page
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}