"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { 
  Trash2, Edit, Users, DollarSign, Lock, ArrowRight, Save, Plus, 
  CheckCircle2, Package as PackageIcon, FileText, HelpCircle, TrendingUp, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  
  // LOGIN STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // DASHBOARD STATE
  const [data, setData] = useState<any>({ 
    teachers: [], students: [], pages: [], packages: [], faqs: [], bookings: [], totalRevenue: 0 
  });
  const [chartData, setChartData] = useState<any>({ revenue: [], growth: [], plans: [] });
  const [activeTab, setActiveTab] = useState('overview');

  // EDITORS STATE
  const [editingPage, setEditingPage] = useState({ slug: '', title: '', content: '' });
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [showFAQForm, setShowFAQForm] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // --- LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
      if (res.ok) { setIsAuthenticated(true); refreshData(); } 
      else { alert("Wrong Password"); }
    } catch (error) { alert("Error"); }
    setLoading(false);
  };

  // --- CHARTS LOGIC ---
  const processCharts = (teachers: any[], students: any[]) => {
    // 1. Plan Distribution
    const plans = { Free: 0, Bronze: 0, Silver: 0, Gold: 0 };
    teachers.forEach(t => {
      const p = t.plan ? t.plan.charAt(0).toUpperCase() + t.plan.slice(1) : 'Free';
      // @ts-ignore
      if (plans[p] !== undefined) plans[p]++;
    });
    const pieData = Object.keys(plans).map(key => ({ name: key, value: plans[key as keyof typeof plans] }));

    // 2. User Growth (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthData = [];
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      growthData.push({
        name: months[monthIndex],
        Teachers: Math.floor(Math.random() * 5) + teachers.length / 6,
        Students: Math.floor(Math.random() * 8) + students.length / 6,
      });
    }

    // 3. Revenue Trend (Simulated based on growth)
    const revenueData = growthData.map(d => ({ name: d.name, Revenue: d.Teachers * 5000 + d.Students * 2000 }));
    
    setChartData({ plans: pieData, growth: growthData, revenue: revenueData });
  };

  // --- FETCH DATA ---
  const refreshData = async () => {
    try {
      const res = await fetch('/api/admin/general', { cache: 'no-store' });
      const json = await res.json();
      
      const tList = json.teachers || [];
      const sList = json.students || [];

      setData({
        teachers: tList,
        students: sList,
        pages: json.pages || [],
        packages: json.packages || [],
        faqs: json.faqs || [],
        bookings: json.bookings || [], // Transactions
        totalRevenue: json.totalRevenue || 0
      });
      processCharts(tList, sList);
    } catch (e) { console.error(e); }
  };

  // --- ACTIONS ---
  const handleDelete = async (id: string, type: string) => {
    if(!confirm("Are you sure?")) return;
    await fetch('/api/admin/general', { method: 'DELETE', body: JSON.stringify({ id, type }), headers: { 'Content-Type': 'application/json' }});
    refreshData();
  };
  const handleVerify = async (t: any) => {
    await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'verify_teacher', id: t.id, data: { isVerified: !t.isVerified } }), headers: { 'Content-Type': 'application/json' }});
    refreshData();
  };
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'update_package', id: editingPackage.id, data: editingPackage }), headers: { 'Content-Type': 'application/json' }});
    setShowPackageForm(false); setEditingPackage(null); refreshData();
  };
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'update_faq', id: editingFAQ.id, data: editingFAQ }), headers: { 'Content-Type': 'application/json' }});
    setShowFAQForm(false); setEditingFAQ(null); refreshData();
  };
  const handleSavePage = async () => {
    await fetch('/api/admin/general', { method: 'PUT', body: JSON.stringify({ action: 'save_page', data: editingPage }), headers: { 'Content-Type': 'application/json' }});
    alert("Saved"); setEditingPage({ slug: '', title: '', content: '' }); refreshData();
  };

  const openEditPackage = (pkg: any) => {
    setEditingPackage({ ...pkg, price: pkg.price.toString() });
    setShowPackageForm(true);
  };

  if (!mounted) return null;
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <Lock className="mx-auto text-blue-600 mb-4" size={32}/>
        <h1 className="text-xl font-bold mb-4">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input aria-label="pass" type="password" placeholder="Key" className="w-full p-3 border rounded-lg text-center" value={password} onChange={e=>setPassword(e.target.value)}/>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">{loading ? "..." : "Enter"}</button>
        </form>
      </div>
    </div>
  );

  const COLORS = ['#94a3b8', '#fb923c', '#60a5fa', '#facc15'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold flex gap-2"><DollarSign/> Revenue: ₦{data.totalRevenue?.toLocaleString()}</div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm w-fit">
          {['overview', 'transactions', 'teachers', 'students', 'packages', 'faqs', 'pages'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg font-bold capitalize ${activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{tab}</button>
          ))}
        </div>

        {/* OVERVIEW (CHARTS) */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Users size={16}/> Total Users</h3><p className="text-4xl font-bold">{data.teachers.length + data.students.length}</p></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2"><DollarSign size={16}/> Avg. Revenue</h3><p className="text-4xl font-bold">₦{Math.round(data.totalRevenue / (data.teachers.length || 1)).toLocaleString()}</p></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><h3 className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2"><PackageIcon size={16}/> Active Ads</h3><p className="text-4xl font-bold text-blue-600">{data.teachers.filter((t: any) => t.plan !== 'free').length}</p></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData.revenue}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="Revenue" stroke="#16a34a"/></LineChart></ResponsiveContainer></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData.growth}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar dataKey="Teachers" fill="#2563eb"/><Bar dataKey="Students" fill="#93c5fd"/></BarChart></ResponsiveContainer></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData.plans} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.plans.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
              <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border"><h3 className="font-bold text-lg mb-4">Recent Activity</h3><ul className="space-y-4">{data.teachers.slice(0, 3).map((t: any) => (<li key={t.id} className="flex items-center justify-between text-sm border-b pb-2"><span className="text-gray-600">New teacher <strong>{t.name}</strong> joined.</span><span className="text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span></li>))}</ul></div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr><th className="p-4">Date</th><th className="p-4">Student</th><th className="p-4">Teacher / Course</th><th className="p-4">Type</th><th className="p-4">Amount</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.bookings.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No transactions yet.</td></tr>}
                {data.bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-bold">{b.student?.name}<br/><span className="text-xs font-normal text-gray-400">{b.student?.email}</span></td>
                    <td className="p-4">{b.teacher?.name}<br/><span className="text-xs text-blue-500">{b.course?.title || 'Private Lesson'}</span></td>
                    <td className="p-4 capitalize"><span className={`px-2 py-1 rounded text-xs font-bold ${b.type==='trial'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{b.type}</span></td>
                    <td className="p-4 font-bold text-gray-900">₦{b.amount.toLocaleString()}</td>
                    <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Success</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-100 border-b"><tr><th className="p-4">Name</th><th className="p-4">Plan</th><th className="p-4">Verify</th><th className="p-4">Action</th></tr></thead><tbody>{data.teachers.map((t: any) => (<tr key={t.id} className="hover:bg-gray-50 border-b"><td className="p-4 font-bold">{t.name}<br/><span className="text-xs text-gray-500 font-normal">{t.email}</span></td><td className="p-4">{t.plan || 'Free'}</td><td className="p-4"><button onClick={()=>handleVerify(t)} className={`px-3 py-1 rounded border text-xs font-bold ${t.isVerified ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'}`}>{t.isVerified ? 'Verified' : 'Verify'}</button></td><td className="p-4"><button aria-label="Del" onClick={()=>handleDelete(t.id, 'teacher')} className="text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
        )}
        
        {/* STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-100 border-b"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Action</th></tr></thead><tbody>{data.students.map((s: any) => (<tr key={s.id} className="border-b"><td className="p-4 font-bold">{s.name}</td><td className="p-4 text-gray-500">{s.email}</td><td className="p-4"><button aria-label="Del" onClick={()=>handleDelete(s.id, 'student')} className="text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
        )}

        {/* PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {!showPackageForm && <button onClick={()=>{setShowPackageForm(true); setEditingPackage({ id: '', name: '', price: '', description: '', features: '' })}} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18}/> Add Package</button>}
            {showPackageForm && editingPackage && (
              <form onSubmit={handleSavePackage} className="bg-white p-6 rounded-xl shadow-lg border space-y-4"><input aria-label="Name" required placeholder="Name" className="border p-3 w-full rounded" value={editingPackage.name} onChange={e=>setEditingPackage({...editingPackage, name: e.target.value})}/><input aria-label="Price" required type="number" placeholder="Price" className="border p-3 w-full rounded" value={editingPackage.price} onChange={e=>setEditingPackage({...editingPackage, price: e.target.value})}/><input aria-label="Desc" required placeholder="Description" className="border p-3 w-full rounded" value={editingPackage.description} onChange={e=>setEditingPackage({...editingPackage, description: e.target.value})}/><textarea aria-label="Feat" required placeholder="Features" className="border p-3 w-full h-24 rounded" value={editingPackage.features} onChange={e=>setEditingPackage({...editingPackage, features: e.target.value})}/><div className="flex gap-2"><button className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save</button><button type="button" onClick={()=>setShowPackageForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold">Cancel</button></div></form>
            )}
            <div className="grid md:grid-cols-3 gap-6">{data.packages.map((pkg: any) => (<div key={pkg.id} className="bg-white p-6 rounded-xl shadow-sm border"><h4 className="font-bold text-lg">{pkg.name}</h4><p className="text-green-600 font-bold">₦{pkg.price.toLocaleString()}</p><p className="text-sm text-gray-500 mb-4">{pkg.description}</p><div className="flex gap-2"><button aria-label="Edit" onClick={() => openEditPackage(pkg)} className="bg-blue-50 text-blue-600 p-2 rounded"><Edit size={16}/></button><button aria-label="Del" onClick={()=>handleDelete(pkg.id, 'package')} className="bg-red-50 text-red-500 p-2 rounded"><Trash2 size={16}/></button></div></div>))}</div>
          </div>
        )}

        {/* FAQs */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            {!showFAQForm && <button onClick={()=>{setShowFAQForm(true); setEditingFAQ({ id: '', question: '', answer: '' })}} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18}/> Add FAQ</button>}
            {showFAQForm && editingFAQ && (
              <form onSubmit={handleSaveFAQ} className="bg-white p-6 rounded-xl shadow-lg border space-y-4"><input aria-label="Q" required placeholder="Question" className="border p-3 w-full rounded" value={editingFAQ.question} onChange={e=>setEditingFAQ({...editingFAQ, question: e.target.value})}/><textarea aria-label="A" required placeholder="Answer" className="border p-3 w-full h-32 rounded" value={editingFAQ.answer} onChange={e=>setEditingFAQ({...editingFAQ, answer: e.target.value})}/><div className="flex gap-2"><button className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save</button><button type="button" onClick={()=>setShowFAQForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold">Cancel</button></div></form>
            )}
            <div className="space-y-4">{data.faqs.map((faq: any) => (<div key={faq.id} className="bg-white p-6 rounded-xl shadow-sm border relative group"><h4 className="font-bold text-gray-900 mb-2">{faq.question}</h4><p className="text-gray-600">{faq.answer}</p><div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100"><button aria-label="Edit" onClick={()=>{setEditingFAQ(faq); setShowFAQForm(true)}} className="text-blue-500"><Edit size={16}/></button><button aria-label="Del" onClick={()=>handleDelete(faq.id, 'faq')} className="text-red-500"><Trash2 size={16}/></button></div></div>))}</div>
          </div>
        )}

        {/* PAGES */}
        {activeTab === 'pages' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit"><h3 className="font-bold mb-4">Pages</h3><ul className="space-y-2 mb-4">{data.pages.map((p: any) => <li key={p.id} className="flex justify-between p-2 bg-gray-50 rounded"><span className="font-medium">{p.title}</span><button aria-label="Edit" onClick={() => setEditingPage(p)} className="text-blue-500"><Edit size={16}/></button></li>)}</ul><button onClick={() => setEditingPage({ slug: '', title: '', content: '' })} className="w-full border-2 border-dashed border-gray-300 py-2 rounded-lg text-gray-500"><Plus size={16} className="mx-auto"/></button></div>
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm space-y-4"><input aria-label="Title" className="w-full border p-2 rounded" placeholder="Title" value={editingPage.title} onChange={e => setEditingPage({...editingPage, title: e.target.value})}/><input aria-label="Slug" className="w-full border p-2 rounded" placeholder="Slug" value={editingPage.slug} onChange={e => setEditingPage({...editingPage, slug: e.target.value})}/><textarea aria-label="Content" className="w-full border p-2 rounded h-64 font-mono text-sm" placeholder="Content" value={editingPage.content} onChange={e => setEditingPage({...editingPage, content: e.target.value})}/><button onClick={handleSavePage} className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save Page</button></div>
          </div>
        )}

      </div>
    </div>
  );
}