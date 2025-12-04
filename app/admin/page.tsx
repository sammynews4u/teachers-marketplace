"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { 
  Trash2, Edit, Users, DollarSign, Package, Lock, ArrowRight, Save, Plus, CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  // LOGIN STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // DASHBOARD STATE
  const [data, setData] = useState<any>({ teachers: [], students: [], pages: [], packages: [], totalRevenue: 0 });
  const [activeTab, setActiveTab] = useState('teachers');
  const [editingPage, setEditingPage] = useState({ slug: '', title: '', content: '' });
  const [editingPackage, setEditingPackage] = useState<any>(null);

  // --- 1. HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setIsAuthenticated(true);
      refreshData(); // Load data only after login
    } else {
      alert("Access Denied: Wrong Password");
    }
    setLoading(false);
  };

  // --- 2. FETCH DATA (Only called after login) ---
  const refreshData = () => {
    fetch('/api/admin/general')
      .then(res => res.json())
      .then(res => {
        setData(res);
      });
  };

  // --- ACTIONS (Verify, Delete, Save) ---
  const handleVerify = async (teacher: any) => {
    await fetch('/api/admin/general', {
      method: 'PUT',
      body: JSON.stringify({ action: 'verify_teacher', id: teacher.id, data: { isVerified: !teacher.isVerified } }),
      headers: { 'Content-Type': 'application/json' }
    });
    refreshData();
  };

  const handleDelete = async (id: string, type: string) => {
    if(!confirm("Are you sure? This is irreversible.")) return;
    await fetch('/api/admin/general', {
      method: 'DELETE',
      body: JSON.stringify({ id, type }),
      headers: { 'Content-Type': 'application/json' }
    });
    refreshData();
  };

  const handleSavePage = async () => {
    await fetch('/api/admin/general', {
      method: 'PUT',
      body: JSON.stringify({ action: 'save_page', data: editingPage }),
      headers: { 'Content-Type': 'application/json' }
    });
    alert("Page Saved!");
    setEditingPage({ slug: '', title: '', content: '' });
    refreshData();
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/general', {
      method: 'PUT',
      body: JSON.stringify({ action: 'update_package', id: editingPackage.id, data: editingPackage }),
      headers: { 'Content-Type': 'application/json' }
    });
    alert("Package Saved!");
    setEditingPackage(null);
    refreshData();
  };

  // --- RENDER LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 mb-6">Enter your master password to continue.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Secret Key" 
              className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-600 text-center text-lg tracking-widest"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : <>Unlock Dashboard <ArrowRight size={20}/></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD (Only shows if Authenticated) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
            <DollarSign size={20}/> Revenue: ₦{data.totalRevenue?.toLocaleString()}
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-4 mb-8 bg-white p-2 rounded-xl shadow-sm w-fit">
          {['teachers', 'students', 'packages', 'pages'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-6 py-2 rounded-lg font-bold capitalize transition ${activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- TEACHERS TAB --- */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-100 border-b text-sm text-gray-600 uppercase">
                <tr>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {data.teachers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.plan === 'gold' ? 'bg-yellow-100 text-yellow-800' : t.plan === 'silver' ? 'bg-gray-200 text-gray-800' : 'bg-orange-50 text-orange-800'}`}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      {t.hasOnboarded ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Active</span> : <span className="text-gray-400">Pending</span>}
                    </td>
                    <td className="p-4 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleVerify(t)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${t.isVerified ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                      >
                        {t.isVerified ? 'Verified' : 'Verify Now'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(t.id, 'teacher')} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg">
                        <Trash2 size={16} />
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
              <thead className="bg-gray-100 border-b text-sm text-gray-600 uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {data.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{s.name}</td>
                    <td className="p-4 text-gray-500">{s.email}</td>
                    <td className="p-4 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(s.id, 'student')} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PACKAGES TAB --- */}
        {activeTab === 'packages' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <button 
                onClick={() => setEditingPackage({ name: '', price: '', description: '', features: '' })}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-500 transition flex justify-center items-center gap-2"
              >
                <Plus size={18} /> Add New Package
              </button>
              
              {data.packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                    <p className="text-green-600 font-bold text-sm">₦{pkg.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPackage(pkg)} className="text-blue-500 bg-blue-50 p-2 rounded-lg"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(pkg.id, 'package')} className="text-red-500 bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2">
              {editingPackage ? (
                <form onSubmit={handleSavePackage} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold text-lg">{editingPackage.id ? 'Edit Package' : 'New Package'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Name (e.g. Gold Plan)" className="border p-3 rounded-lg" value={editingPackage.name} onChange={e => setEditingPackage({...editingPackage, name: e.target.value})}/>
                    <input required type="number" placeholder="Price (₦)" className="border p-3 rounded-lg" value={editingPackage.price} onChange={e => setEditingPackage({...editingPackage, price: e.target.value})}/>
                  </div>
                  <input required placeholder="Short Description" className="w-full border p-3 rounded-lg" value={editingPackage.description} onChange={e => setEditingPackage({...editingPackage, description: e.target.value})}/>
                  <textarea required placeholder="Features (comma separated)" className="w-full border p-3 rounded-lg h-24" value={editingPackage.features} onChange={e => setEditingPackage({...editingPackage, features: e.target.value})}/>
                  <div className="flex gap-3">
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">Save Package</button>
                    <button type="button" onClick={() => setEditingPackage(null)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-bold">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Select or create a package to edit
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PAGES TAB (CMS) --- */}
        {activeTab === 'pages' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
              <h3 className="font-bold mb-4">Pages</h3>
              <ul className="space-y-2">
                {data.pages.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">{p.title}</span>
                    <button onClick={() => setEditingPage(p)} className="text-blue-500"><Edit size={16}/></button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setEditingPage({ slug: '', title: '', content: '' })} className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 py-2 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500">
                <Plus size={16} /> Create Page
              </button>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-4 text-xl">Page Editor</h3>
              <div className="space-y-4">
                <input className="w-full border p-2 rounded-lg" placeholder="Page Title" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})}/>
                <input className="w-full border p-2 rounded-lg bg-gray-50" placeholder="URL Slug (e.g. terms)" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})}/>
                <textarea className="w-full border p-2 rounded-lg h-64 font-mono text-sm" placeholder="HTML Content..." value={editingPage.content} onChange={e => setEditingPage({...editingPage, content: e.target.value})}/>
                <button onClick={handleSavePage} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Save size={18} /> Save Page</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}