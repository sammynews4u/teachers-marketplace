"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { 
  Trash2, Edit, Users, DollarSign, Lock, ArrowRight, Save, Plus, 
  CheckCircle2, Package as PackageIcon, FileText, HelpCircle, TrendingUp, 
  BarChart3, PieChart as PieIcon, Settings, Ban, Undo2, Star, BookOpen, Megaphone, Eye, X
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // DATA STATE
  const [data, setData] = useState<any>({ 
    teachers: [], students: [], pages: [], packages: [], faqs: [], bookings: [], 
    courses: [], reviews: [], payouts: [],
    totalRevenue: 0, platformProfit: 0, settings: {} 
  });
  const [chartData, setChartData] = useState<any>({ revenue: [], growth: [], plans: [] });
  const [activeTab, setActiveTab] = useState('overview');

  // EDITORS STATE
  const [editingPage, setEditingPage] = useState({ slug: '', title: '', content: '' });
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ commissionRate: 10, supportEmail: '', maintenanceMode: false });

  // COURSE PREVIEW
  const [viewingCourse, setViewingCourse] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const res = await fetch('/api/admin/auth', { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { setIsAuthenticated(true); refreshData(); } else { alert("Wrong Password"); }
    setLoading(false);
  };

  const processCharts = (teachers: any[], students: any[]) => {
    const plans = { Free: 0, Bronze: 0, Silver: 0, Gold: 0 };
    teachers.forEach(t => { const p = t.plan ? t.plan.charAt(0).toUpperCase() + t.plan.slice(1) : 'Free'; if (plans[p] !== undefined) plans[p]++; });
    const pieData = Object.keys(plans).map(key => ({ name: key, value: plans[key as keyof typeof plans] }));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthData = [];
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      growthData.push({ name: months[monthIndex], Teachers: Math.floor(Math.random() * 5) + teachers.length / 6, Students: Math.floor(Math.random() * 8) + students.length / 6 });
    }
    const revenueData = growthData.map(d => ({ name: d.name, Revenue: d.Teachers * 5000 + d.Students * 2000 }));
    setChartData({ plans: pieData, growth: growthData, revenue: revenueData });
  };

  const refreshData = async () => {
    try {
      const res = await fetch('/api/admin/general', { cache: 'no-store' });
      const json = await res.json();
      setData({
        teachers: json.teachers || [], students: json.students || [],
        pages: json.pages || [], packages: json.packages || [],
        faqs: json.faqs || [], bookings: json.bookings || [],
        courses: json.courses || [], reviews: json.reviews || [], payouts: json.payouts || [],
        totalRevenue: json.totalRevenue || 0,
        platformProfit: json.platformProfit || 0,
        settings: json.settings || {}
      });
      setSettingsForm(json.settings || { commissionRate: 10, supportEmail: '', maintenanceMode: false });
      processCharts(json.teachers || [], json.students || []);
    } catch (e) { console.error(e); }
  };

  // ACTIONS
  const handleDelete = async (id: string, type: string) => { if(!confirm("Delete permanently?")) return; await fetch('/api/admin/general', { method: 'DELETE', body: JSON.stringify({ id, type }), headers: { 'Content-Type': 'application/json' }}); refreshData(); };
  const handleVerify = async (t: any) => { await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'verify_teacher', id: t.id, data: { isVerified: !t.isVerified } }), headers: { 'Content-Type': 'application/json' }}); refreshData(); };
  const handleSuspend = async (id: string, type: string, currentStatus: boolean) => { if(!confirm(currentStatus ? "Activate?" : "Suspend?")) return; await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'toggle_suspend', id, data: { type, status: !currentStatus } }) }); refreshData(); };
  const handleRefund = async (id: string) => { if(!confirm("Mark Refunded?")) return; await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'refund_booking', id }) }); refreshData(); };
  const handleSaveSettings = async () => { await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'update_settings', data: settingsForm }) }); alert("Updated!"); refreshData(); };
  const handleApprovePayout = async (id: string) => { if(!confirm("Mark as PAID? Ensure you have sent the money.")) return; await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'approve_payout', id }), headers: { 'Content-Type': 'application/json' }}); refreshData(); };
  
  const handleSavePackage = async (e: React.FormEvent) => { e.preventDefault(); await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'update_package', id: editingPackage.id, data: editingPackage }), headers: { 'Content-Type': 'application/json' }}); setShowPackageForm(false); setEditingPackage(null); refreshData(); };
  const handleSaveFAQ = async (e: React.FormEvent) => { e.preventDefault(); await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'update_faq', id: editingFAQ.id, data: editingFAQ }), headers: { 'Content-Type': 'application/json' }}); setShowFAQForm(false); setEditingFAQ(null); refreshData(); };
  const handleSavePage = async () => { await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'save_page', data: editingPage }), headers: { 'Content-Type': 'application/json' }}); alert("Saved"); refreshData(); };

  // Helpers
  const openEditPackage = (pkg: any) => { setEditingPackage({ ...pkg, price: pkg.price.toString() }); setShowPackageForm(true); };
  const openNewPackage = () => { setEditingPackage({ id: '', name: '', price: '', description: '', features: '' }); setShowPackageForm(true); };

  if (!mounted) return null;
  if (!isAuthenticated) return ( <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4"><div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center"><Lock className="mx-auto text-blue-600 mb-4" size={32}/><h1 className="text-xl font-bold mb-4">Admin Access</h1><form onSubmit={handleLogin} className="space-y-4"><input aria-label="pass" type="password" placeholder="Key" className="w-full p-3 border rounded-lg text-center" value={password} onChange={e=>setPassword(e.target.value)}/><button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">{loading ? "..." : "Enter"}</button></form></div></div> );

  const COLORS = ['#94a3b8', '#fb923c', '#60a5fa', '#facc15'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* COURSE PREVIEW MODAL */}
      {viewingCourse && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">{viewingCourse.title}</h3>
                    <button onClick={() => setViewingCourse(null)}><X className="text-gray-500 hover:text-red-500"/></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-gray-500 mb-4 text-sm">{viewingCourse.description}</p>
                    <div className="flex gap-4 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{viewingCourse.language || "English"}</span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">{viewingCourse.level || "Beginner"}</span>
                    </div>
                    <h4 className="font-bold mb-2">Curriculum</h4>
                    {viewingCourse.modules?.length === 0 && <p className="text-gray-400 text-sm">No content uploaded yet.</p>}
                    <div className="space-y-4">
                        {viewingCourse.modules?.map((mod: any) => (
                            <div key={mod.id} className="border rounded-xl p-4">
                                <h5 className="font-bold text-blue-600 mb-2">{mod.title}</h5>
                                <ul className="space-y-2">
                                    {mod.lessons?.map((les: any) => (
                                        <li key={les.id} className="text-sm flex items-center gap-2 text-gray-700">
                                            <FileText size={14} className="text-gray-400"/> {les.title}
                                        </li>
                                    ))}
                                    {mod.lessons.length === 0 && <li className="text-xs text-gray-400">No lessons</li>}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 text-right">
                    <button onClick={() => setViewingCourse(null)} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Close</button>
                </div>
            </div>
        </div>
      )}

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Control</h1>
          <div className="flex gap-4"><div className="bg-white text-gray-600 px-4 py-2 rounded-lg font-bold border">Volume: ${data.totalRevenue?.toLocaleString()}</div><div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold flex gap-2"><DollarSign/> Profit: ${data.platformProfit?.toLocaleString()}</div></div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm w-fit">
          {['overview', 'transactions', 'payouts', 'teachers', 'students', 'courses', 'reviews', 'packages', 'faqs', 'pages', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-bold capitalize text-sm ${activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{tab}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Users</h3><p className="text-4xl font-bold">{data.teachers.length + data.students.length}</p></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Transactions</h3><p className="text-4xl font-bold">{data.bookings.length}</p></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Maintenance</h3><p className={`text-xl font-bold ${data.settings?.maintenanceMode ? 'text-red-600' : 'text-green-600'}`}>{data.settings?.maintenanceMode ? "ACTIVE (Site Locked)" : "Disabled (Site Live)"}</p></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData.revenue}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="Revenue" stroke="#16a34a"/></LineChart></ResponsiveContainer></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData.growth}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar dataKey="Teachers" fill="#2563eb"/><Bar dataKey="Students" fill="#93c5fd"/></BarChart></ResponsiveContainer></div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-100 border-b"><tr><th className="p-4">Date</th><th className="p-4">Payer</th><th className="p-4">Item</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{data.bookings.map((b: any) => (<tr key={b.id} className="hover:bg-gray-50 border-b"><td className="p-4 text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td><td className="p-4 font-bold">{b.student?.name || b.teacher?.name}</td><td className="p-4">{b.type}</td><td className="p-4 font-bold text-gray-900">${b.amount}</td><td className="p-4">{b.isRefunded ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Refunded</span> : <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Success</span>}</td><td className="p-4">{!b.isRefunded && <button onClick={() => handleRefund(b.id)} className="text-xs bg-gray-200 hover:bg-red-100 hover:text-red-600 px-2 py-1 rounded flex items-center gap-1"><Undo2 size={12}/> Refund</button>}</td></tr>))}</tbody></table></div>
        )}

        {/* PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-100 border-b"><tr><th className="p-4">Teacher</th><th className="p-4">Amount</th><th className="p-4">Bank Details</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>
            {data.payouts.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50 border-b">
                <td className="p-4 font-bold">{p.teacher?.name}</td>
                <td className="p-4 text-green-600 font-bold">${p.amount}</td>
                <td className="p-4 text-xs text-gray-600 font-mono">{p.bankDetails}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                <td className="p-4">{p.status === 'pending' && <button onClick={() => handleApprovePayout(p.id)} className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-600">Mark Paid</button>}</td>
              </tr>
            ))}
            {data.payouts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">No requests yet.</td></tr>}
          </tbody></table></div>
        )}

        {/* TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-100 border-b"><tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Verify</th><th className="p-4">Actions</th></tr></thead><tbody>{data.teachers.map((t: any) => (<tr key={t.id} className="hover:bg-gray-50 border-b"><td className="p-4 font-bold">{t.name}<br/><span className="text-xs text-gray-500 font-normal">{t.email}</span></td><td className="p-4">{t.isSuspended ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Suspended</span> : <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>}</td><td className="p-4 flex gap-2"><button onClick={()=>handleVerify(t)} className={`px-2 py-1 rounded border text-xs font-bold ${t.isVerified ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'}`}>{t.isVerified ? 'Ok' : 'Verify'}</button><button onClick={()=>handleSuspend(t.id, 'teacher', t.isSuspended)} title="Suspend" className="text-orange-500 bg-orange-50 p-2 rounded"><Ban size={16}/></button><button onClick={()=>handleDelete(t.id, 'teacher')} className="text-red-500 bg-red-50 p-2 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
        )}
        
        {/* STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-100 border-b"><tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{data.students.map((s: any) => (<tr key={s.id} className="hover:bg-gray-50 border-b"><td className="p-4 font-bold">{s.name}<br/><span className="text-xs text-gray-500 font-normal">{s.email}</span></td><td className="p-4">{s.isSuspended ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Suspended</span> : <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>}</td><td className="p-4 flex gap-2"><button onClick={()=>handleSuspend(s.id, 'student', s.isSuspended)} className="text-orange-500 bg-orange-50 p-2 rounded"><Ban size={16}/></button><button onClick={()=>handleDelete(s.id, 'student')} className="text-red-500 bg-red-50 p-2 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
        )}

        {/* COURSES (NEW) */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-100 border-b"><tr><th className="p-4">Course</th><th className="p-4">Teacher</th><th className="p-4">Price</th><th className="p-4">Action</th></tr></thead><tbody>{data.courses.length===0 && <tr><td colSpan={4} className="p-4 text-center">No courses.</td></tr>}{data.courses.map((c: any) => (<tr key={c.id} className="hover:bg-gray-50 border-b"><td className="p-4 font-bold">{c.title}</td><td className="p-4 text-sm">{c.teacher?.name}</td><td className="p-4 text-green-600 font-bold">${c.price}</td><td className="p-4 flex gap-2"><button onClick={() => setViewingCourse(c)} className="bg-blue-50 text-blue-600 p-2 rounded"><Eye size={16}/></button><button onClick={()=>handleDelete(c.id, 'course')} className="text-red-500 p-2 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
        )}

        {/* REVIEWS (NEW) */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">{data.reviews.length===0 && <p className="text-center text-gray-500">No reviews.</p>}{data.reviews.map((r: any) => (<div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-start"><div><div className="flex gap-2 font-bold text-sm"><span>{r.student?.name}</span><span className="text-gray-400">reviewed</span><span>{r.teacher?.name}</span></div><div className="flex gap-1 text-yellow-400 mb-2">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}</div><p className="text-gray-600 italic">"{r.comment}"</p></div><button onClick={()=>handleDelete(r.id, 'review')} className="text-red-500"><Trash2 size={16}/></button></div>))}</div>
        )}

        {/* PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {!showPackageForm && <button onClick={openNewPackage} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18}/> Add Package</button>}
            {showPackageForm && editingPackage && (<form onSubmit={handleSavePackage} className="bg-white p-6 rounded-xl shadow-lg border space-y-4"><input aria-label="Name" required placeholder="Name" className="border p-3 w-full rounded" value={editingPackage.name} onChange={e=>setEditingPackage({...editingPackage, name: e.target.value})}/><input aria-label="Price" required type="number" placeholder="Price" className="border p-3 w-full rounded" value={editingPackage.price} onChange={e=>setEditingPackage({...editingPackage, price: e.target.value})}/><input aria-label="Desc" required placeholder="Description" className="border p-3 w-full rounded" value={editingPackage.description} onChange={e=>setEditingPackage({...editingPackage, description: e.target.value})}/><textarea aria-label="Feat" required placeholder="Features" className="border p-3 w-full h-24 rounded" value={editingPackage.features} onChange={e=>setEditingPackage({...editingPackage, features: e.target.value})}/><div className="flex gap-2"><button className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save</button><button type="button" onClick={()=>setShowPackageForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold">Cancel</button></div></form>)}
            <div className="grid md:grid-cols-3 gap-6">{data.packages.map((pkg: any) => (<div key={pkg.id} className="bg-white p-6 rounded-xl shadow-sm border"><h4 className="font-bold text-lg">{pkg.name}</h4><p className="text-green-600 font-bold">${pkg.price}</p><p className="text-sm text-gray-500 mb-4">{pkg.description}</p><div className="flex gap-2"><button onClick={() => openEditPackage(pkg)} className="bg-blue-50 text-blue-600 p-2 rounded"><Edit size={16}/></button><button onClick={()=>handleDelete(pkg.id, 'package')} className="bg-red-50 text-red-500 p-2 rounded"><Trash2 size={16}/></button></div></div>))}</div>
          </div>
        )}

        {/* FAQs */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {!showFAQForm && <button onClick={()=>{setShowFAQForm(true); setEditingFAQ({ id: '', question: '', answer: '' })}} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18}/> Add FAQ</button>}
            {showFAQForm && editingFAQ && (<form onSubmit={handleSaveFAQ} className="bg-white p-6 rounded-xl shadow-lg border space-y-4"><input aria-label="Q" required placeholder="Question" className="border p-3 w-full rounded" value={editingFAQ.question} onChange={e=>setEditingFAQ({...editingFAQ, question: e.target.value})}/><textarea aria-label="A" required placeholder="Answer" className="border p-3 w-full h-32 rounded" value={editingFAQ.answer} onChange={e=>setEditingFAQ({...editingFAQ, answer: e.target.value})}/><div className="flex gap-2"><button className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save</button><button type="button" onClick={()=>setShowFAQForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold">Cancel</button></div></form>)}
            <div className="space-y-4">{data.faqs.map((faq: any) => (<div key={faq.id} className="bg-white p-6 rounded-xl shadow-sm border relative group"><h4 className="font-bold text-gray-900 mb-2">{faq.question}</h4><p className="text-gray-600">{faq.answer}</p><div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{setEditingFAQ(faq); setShowFAQForm(true)}} className="text-blue-500"><Edit size={16}/></button><button onClick={()=>handleDelete(faq.id, 'faq')} className="text-red-500"><Trash2 size={16}/></button></div></div>))}</div>
          </div>
        )}

        {/* PAGES */}
        {activeTab === 'pages' && (
          <div className="grid md:grid-cols-3 gap-8"><div className="bg-white p-6 rounded-xl shadow-sm h-fit"><h3 className="font-bold mb-4">Pages</h3><ul className="space-y-2 mb-4">{data.pages.map((p: any) => <li key={p.id} className="flex justify-between p-2 bg-gray-50 rounded"><span className="font-medium">{p.title}</span><button onClick={() => setEditingPage(p)} className="text-blue-500"><Edit size={16}/></button></li>)}</ul><button onClick={() => setEditingPage({ slug: '', title: '', content: '' })} className="w-full border-2 border-dashed border-gray-300 py-2 rounded-lg text-gray-500"><Plus size={16} className="mx-auto"/></button></div><div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm space-y-4"><input aria-label="Title" className="w-full border p-2 rounded" placeholder="Title" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})}/><input aria-label="Slug" className="w-full border p-2 rounded" placeholder="Slug" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})}/><textarea aria-label="Content" className="w-full border p-2 rounded h-64 font-mono text-sm" placeholder="Content" value={editingPage.content} onChange={e => setEditingPage({...editingPage, content: e.target.value})}/><button onClick={handleSavePage} className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save Page</button></div></div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={24}/> Platform Settings</h3>
            <div className="space-y-6">
              <div><label className="block font-bold mb-2">Commission Rate (%)</label><input aria-label="Commission" type="number" className="w-full border p-3 rounded-lg" value={settingsForm.commissionRate} onChange={e => setSettingsForm({...settingsForm, commissionRate: parseInt(e.target.value)})}/></div>
              <div><label className="block font-bold mb-2">Support Email</label><input aria-label="Email" type="email" className="w-full border p-3 rounded-lg" value={settingsForm.supportEmail} onChange={e => setSettingsForm({...settingsForm, supportEmail: e.target.value})}/></div>
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <input aria-label="Maintenance" type="checkbox" className="w-5 h-5" checked={settingsForm.maintenanceMode} onChange={e => setSettingsForm({...settingsForm, maintenanceMode: e.target.checked})}/>
                <div><label className="font-bold text-yellow-800">Maintenance Mode</label><p className="text-xs text-yellow-700">If checked, users cannot login.</p></div>
              </div>
              <button onClick={handleSaveSettings} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold w-full hover:bg-blue-700">Save System Settings</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}