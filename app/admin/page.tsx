"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { 
  Trash2, Edit, Users, DollarSign, Lock, ArrowRight, Save, Plus, CheckCircle2, Package as PackageIcon, FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  
  // LOGIN STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // DASHBOARD STATE
  const [data, setData] = useState<any>({ 
    teachers: [], 
    students: [], 
    pages: [], 
    packages: [], 
    totalRevenue: 0 
  });
  
  const [activeTab, setActiveTab] = useState('teachers');
  
  // EDITORS STATE
  const [editingPage, setEditingPage] = useState({ slug: '', title: '', content: '' });
  const [editingPackage, setEditingPackage] = useState<any>(null); // Holds the package being edited
  const [showPackageForm, setShowPackageForm] = useState(false);   // Toggles form visibility

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- 1. HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setIsAuthenticated(true);
        refreshData(); 
      } else {
        alert("Access Denied: Wrong Password");
      }
    } catch (error) {
      alert("Login Error: Could not connect to server");
    }
    setLoading(false);
  };

  // --- 2. FETCH DATA ---
  const refreshData = () => {
    fetch('/api/admin/general')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(res => {
        setData({
          teachers: Array.isArray(res.teachers) ? res.teachers : [],
          students: Array.isArray(res.students) ? res.students : [],
          pages: Array.isArray(res.pages) ? res.pages : [],
          packages: Array.isArray(res.packages) ? res.packages : [],
          totalRevenue: res.totalRevenue || 0
        });
      })
      .catch(err => console.error(err));
  };

  // --- ACTIONS ---
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

  // --- SAVE PAGE ---
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

  // --- SAVE PACKAGE ---
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/general', {
      method: 'PUT',
      body: JSON.stringify({ 
        action: 'update_package', 
        id: editingPackage.id, // If null, backend creates new
        data: editingPackage 
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    alert("Package Saved!");
    setShowPackageForm(false);
    setEditingPackage(null);
    refreshData();
  };

  const openEditPackage = (pkg: any) => {
    setEditingPackage({ ...pkg, price: pkg.price.toString() });
    setShowPackageForm(true);
  };

  const openNewPackage = () => {
    setEditingPackage({ id: null, name: '', price: '', description: '', features: '' });
    setShowPackageForm(true);
  };

  if (!mounted) return null;

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              aria-label="Admin Password"
              type="password" 
              placeholder="Enter Secret Key" 
              className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-600 text-center text-lg tracking-widest"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
              {loading ? "Verifying..." : <>Unlock Dashboard <ArrowRight size={20}/></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
            <DollarSign size={20}/> Revenue: ₦{data.totalRevenue?.toLocaleString() || 0}
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
                <tr><th className="p-4">Teacher</th><th className="p-4">Plan</th><th className="p-4">Status</th><th className="p-4">Verification</th><th className="p-4">Action</th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {data.teachers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4"><p className="font-bold text-gray-900">{t.name}</p><p className="text-gray-500 text-xs">{t.email}</p></td>
                    <td className="p-4"><span className="bg-orange-50 text-orange-800 px-2 py-1 rounded text-xs font-bold uppercase">{t.plan || 'Free'}</span></td>
                    <td className="p-4">{t.hasOnboarded ? <span className="text-green-600 flex gap-1"><CheckCircle2 size={14}/> Active</span> : <span className="text-gray-400">Pending</span>}</td>
                    <td className="p-4">
                      <button onClick={() => handleVerify(t)} className={`px-3 py-1 rounded-full text-xs font-bold border transition ${t.isVerified ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                        {t.isVerified ? 'Verified' : 'Verify Now'}
                      </button>
                    </td>
                    <td className="p-4"><button aria-label="Delete" onClick={() => handleDelete(t.id, 'teacher')} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button></td>
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
                <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Action</th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {data.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{s.name}</td>
                    <td className="p-4 text-gray-500">{s.email}</td>
                    <td className="p-4"><button aria-label="Delete" onClick={() => handleDelete(s.id, 'student')} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PACKAGES TAB (UPDATED) --- */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            
            {/* Show Add Button only if form is hidden */}
            {!showPackageForm && (
              <button onClick={openNewPackage} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition">
                <Plus size={20}/> Add New Package
              </button>
            )}

            {/* PACKAGE FORM */}
            {showPackageForm && editingPackage && (
              <form onSubmit={handleSavePackage} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-in fade-in">
                <h3 className="font-bold text-xl mb-4">{editingPackage.id ? 'Edit Package' : 'New Package'}</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input aria-label="Name" required placeholder="Package Name (e.g. Gold)" className="border p-3 rounded-lg" value={editingPackage.name} onChange={e => setEditingPackage({...editingPackage, name: e.target.value})}/>
                  <input aria-label="Price" required type="number" placeholder="Price (₦)" className="border p-3 rounded-lg" value={editingPackage.price} onChange={e => setEditingPackage({...editingPackage, price: e.target.value})}/>
                </div>
                <input aria-label="Description" required placeholder="Short Description" className="border p-3 rounded-lg w-full mb-4" value={editingPackage.description} onChange={e => setEditingPackage({...editingPackage, description: e.target.value})}/>
                <textarea aria-label="Features" required placeholder="Features (comma separated)" className="border p-3 rounded-lg w-full h-24 mb-4" value={editingPackage.features} onChange={e => setEditingPackage({...editingPackage, features: e.target.value})}/>
                <div className="flex gap-3">
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">Save Package</button>
                  <button type="button" onClick={() => setShowPackageForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold">Cancel</button>
                </div>
              </form>
            )}

            {/* PACKAGE LIST */}
            <div className="grid md:grid-cols-3 gap-6">
              {data.packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{pkg.name}</h4>
                      <p className="text-gray-500 text-sm">{pkg.description}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg">₦{pkg.price.toLocaleString()}</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6 h-20 overflow-hidden">
                    {pkg.features.split(',').map((f: string, i: number) => <li key={i}>• {f.trim()}</li>)}
                  </ul>
                  <div className="flex gap-2 border-t pt-4">
                    <button onClick={() => openEditPackage(pkg)} className="flex-1 flex justify-center items-center gap-2 text-blue-600 bg-blue-50 py-2 rounded-lg font-bold hover:bg-blue-100"><Edit size={16}/> Edit</button>
                    <button onClick={() => handleDelete(pkg.id, 'package')} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
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
                    <button aria-label="Edit" onClick={() => setEditingPage(p)} className="text-blue-500"><Edit size={16}/></button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setEditingPage({ slug: '', title: '', content: '' })} className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 py-2 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"><Plus size={16} /> Create Page</button>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold mb-4 text-xl">Page Editor</h3>
              <div className="space-y-4">
                <input aria-label="Title" className="w-full border p-2 rounded-lg" placeholder="Page Title" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})}/>
                <input aria-label="Slug" className="w-full border p-2 rounded-lg bg-gray-50" placeholder="URL Slug (e.g. terms)" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})}/>
                <textarea aria-label="Content" className="w-full border p-2 rounded-lg h-64 font-mono text-sm" placeholder="HTML Content..." value={editingPage.content} onChange={e => setEditingPage({...editingPage, content: e.target.value})}/>
                <button onClick={handleSavePage} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Save size={18} /> Save Page</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}