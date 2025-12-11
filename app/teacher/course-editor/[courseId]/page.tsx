"use client";

import Navbar from '../../../../components/Navbar';
import UploadButton from '../../../../components/UploadButton';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, Video, FileText, Trash2, Save, ArrowLeft, Layers, Settings, BookOpen, CheckCircle 
} from 'lucide-react';

export default function CourseStudio() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, curriculum, settings
  const [saving, setSaving] = useState(false);

  // Curriculum State
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', description: '', resources: [] as any[] });

  // 1. Load Course Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch(`/api/courses/${params.courseId}`)
      .then(res => res.json())
      .then(data => setCourse(data));
  };

  // 2. Save Basic Info
  const handleSaveOverview = async () => {
    setSaving(true);
    await fetch(`/api/courses/${params.courseId}`, {
      method: 'PUT',
      body: JSON.stringify(course),
      headers: { 'Content-Type': 'application/json' }
    });
    setSaving(false);
    alert("Course Details Saved!");
  };

  // 3. Curriculum Handlers
  const addModule = async () => {
    await fetch(`/api/courses/${params.courseId}/chapters`, {
      method: 'POST', body: JSON.stringify({ type: 'module', title: moduleTitle })
    });
    setModuleTitle(""); setShowModuleForm(false); fetchData();
  };

  const addLesson = async () => {
    await fetch(`/api/courses/${params.courseId}/chapters`, {
      method: 'POST', body: JSON.stringify({ type: 'lesson', moduleId: activeModuleId, ...lessonForm })
    });
    setLessonForm({ title: '', videoUrl: '', description: '', resources: [] }); 
    setActiveModuleId(null); 
    fetchData();
  };

  if (!course) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Loading Studio...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/teacher-dashboard')} className="p-2 bg-white rounded-full border hover:bg-gray-100"><ArrowLeft size={20}/></button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                    <p className="text-gray-500 text-sm">Course Studio</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Preview</button>
                <button onClick={handleSaveOverview} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    {saving ? "Saving..." : <><Save size={18}/> Save Changes</>}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* SIDEBAR TABS */}
            <div className="lg:col-span-1 space-y-2">
                <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    <BookOpen size={18}/> Course Overview
                </button>
                <button onClick={() => setActiveTab('curriculum')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'curriculum' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    <Layers size={18}/> Curriculum & Modules
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    <Settings size={18}/> Settings & Pricing
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-3">
                
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
                                    <input className="w-full border p-3 rounded-lg" value={course.title} onChange={e => setCourse({...course, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                    <textarea className="w-full border p-3 rounded-lg h-32" value={course.description} onChange={e => setCourse({...course, description: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Cover Image</label>
                                    <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 h-40">
                                        {course.image ? <img src={course.image} className="h-full object-cover rounded-lg"/> : <p className="text-gray-400 text-xs">No image</p>}
                                        <div className="mt-2"><UploadButton onUpload={(url) => setCourse({...course, image: url})} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Language</label>
                                <select className="w-full border p-3 rounded-lg bg-white" value={course.language || 'English'} onChange={e => setCourse({...course, language: e.target.value})}>
                                    <option value="English">English</option>
                                    <option value="French">French</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="German">German</option>
                                    <option value="Chinese">Chinese</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Target Level</label>
                                <select className="w-full border p-3 rounded-lg bg-white" value={course.level || 'Beginner'} onChange={e => setCourse({...course, level: e.target.value})}>
                                    <option value="Beginner">Beginner (A1-A2)</option>
                                    <option value="Intermediate">Intermediate (B1-B2)</option>
                                    <option value="Advanced">Advanced (C1-C2)</option>
                                </select>
                             </div>
                        </div>

                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">What will students learn? (Outcomes)</label>
                             <textarea placeholder="e.g. Master grammar, Speak fluently..." className="w-full border p-3 rounded-lg" value={course.outcomes || ''} onChange={e => setCourse({...course, outcomes: e.target.value})} />
                        </div>
                    </div>
                )}

                {/* TAB 2: CURRICULUM */}
                {activeTab === 'curriculum' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Modules & Lessons</h2>
                            <button onClick={() => setShowModuleForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus size={16}/> Add Module</button>
                        </div>

                        {showModuleForm && (
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex gap-2">
                                <input autoFocus className="flex-1 border p-2 rounded-lg" placeholder="Module Title (e.g. Introduction)" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} />
                                <button onClick={addModule} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Add</button>
                                <button onClick={() => setShowModuleForm(false)} className="text-gray-500 px-3">Cancel</button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {course.modules?.map((module: any) => (
                                <div key={module.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                    <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                                        <h3 className="font-bold text-gray-800">{module.title}</h3>
                                        <button onClick={() => setActiveModuleId(module.id)} className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1"><Plus size={12}/> Add Lesson</button>
                                    </div>
                                    <div className="divide-y">
                                        {module.lessons.map((lesson: any) => (
                                            <div key={lesson.id} className="p-4 flex items-center gap-3 hover:bg-gray-50">
                                                <Video size={18} className="text-gray-400"/>
                                                <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                                            </div>
                                        ))}
                                        {module.lessons.length === 0 && <p className="p-4 text-center text-xs text-gray-400">No lessons yet.</p>}
                                    </div>
                                    
                                    {/* Add Lesson Form */}
                                    {activeModuleId === module.id && (
                                        <div className="p-6 bg-blue-50 border-t space-y-3">
                                            <h4 className="font-bold text-blue-900 text-sm">New Lesson Details</h4>
                                            <input className="w-full border p-2 rounded" placeholder="Lesson Title" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} />
                                            <div className="flex gap-2">
                                                <input className="flex-1 border p-2 rounded" placeholder="Video URL (YouTube/Cloudinary)" value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} />
                                                <div className="w-fit"><UploadButton onUpload={(url) => setLessonForm({...lessonForm, videoUrl: url})} /></div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button onClick={addLesson} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">Save Lesson</button>
                                                <button onClick={() => setActiveModuleId(null)} className="text-gray-500 px-4 text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB 3: SETTINGS */}
                {activeTab === 'settings' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                                <input type="number" className="w-full border p-3 rounded-lg" value={course.price} onChange={e => setCourse({...course, price: parseInt(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Class Schedule</label>
                                <input className="w-full border p-3 rounded-lg" value={course.schedule} onChange={e => setCourse({...course, schedule: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                <input type="date" className="w-full border p-3 rounded-lg" value={course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : ''} onChange={e => setCourse({...course, startDate: e.target.value})} />
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                                <input type="date" className="w-full border p-3 rounded-lg" value={course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''} onChange={e => setCourse({...course, endDate: e.target.value})} />
                             </div>
                        </div>
                        <div className="pt-4 border-t">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-6 h-6 text-green-600" checked={course.published} onChange={e => setCourse({...course, published: e.target.checked})} />
                                <div>
                                    <span className="font-bold text-gray-900 block">Publish Course</span>
                                    <span className="text-xs text-gray-500">Make this course visible to students on the marketplace.</span>
                                </div>
                            </label>
                        </div>
                        <button onClick={handleSaveOverview} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">Save All Changes</button>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}