"use client";

import Navbar from '../../../../components/Navbar';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Video, FileText, Trash2, Save, ArrowLeft } from 'lucide-react';
import UploadButton from '../../../../components/UploadButton';

export default function CourseBuilder() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  // Forms
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', description: '', resources: [] as any[] });

  useEffect(() => {
    fetch(`/api/courses/${params.courseId}/chapters`)
      .then(res => res.json())
      .then(data => setCourse(data));
  }, [refresh]);

  const addModule = async () => {
    await fetch(`/api/courses/${params.courseId}/chapters`, {
      method: 'POST', body: JSON.stringify({ type: 'module', title: moduleTitle })
    });
    setModuleTitle(""); setShowModuleForm(false); setRefresh(r => r + 1);
  };

  const addLesson = async () => {
    await fetch(`/api/courses/${params.courseId}/chapters`, {
      method: 'POST', body: JSON.stringify({ type: 'lesson', moduleId: activeModuleId, ...lessonForm })
    });
    setLessonForm({ title: '', videoUrl: '', description: '', resources: [] }); 
    setActiveModuleId(null); 
    setRefresh(r => r + 1);
  };

  if (!course) return <div className="p-20 text-center">Loading Builder...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <button onClick={() => router.back()} className="text-gray-500 text-sm flex items-center gap-1 mb-2 hover:text-blue-600"><ArrowLeft size={16}/> Back to Dashboard</button>
                <h1 className="text-3xl font-bold text-gray-900">Course Builder: {course.title}</h1>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">Publish Changes</button>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
            {course.modules?.map((module: any) => (
                <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
                        <h3 className="font-bold text-lg">{module.title}</h3>
                        <button onClick={() => setActiveModuleId(module.id)} className="text-blue-600 text-sm font-bold flex items-center gap-1"><Plus size={16}/> Add Lesson</button>
                    </div>

                    {/* Lessons inside Module */}
                    <div className="divide-y">
                        {module.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                <Video size={20} className="text-gray-400"/>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{lesson.title}</h4>
                                    <p className="text-xs text-gray-500">{lesson.resources.length} Resources • Video: {lesson.videoUrl ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        ))}
                        {module.lessons.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">No lessons yet.</p>}
                    </div>

                    {/* Add Lesson Form */}
                    {activeModuleId === module.id && (
                        <div className="p-6 bg-blue-50 border-t space-y-4">
                            <h4 className="font-bold text-blue-800">New Lesson for {module.title}</h4>
                            <input className="w-full border p-2 rounded" placeholder="Lesson Title" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} />
                            <textarea className="w-full border p-2 rounded" placeholder="Description / Text Content" value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} />
                            
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500">Video (Upload or URL)</label>
                                    <UploadButton onUpload={(url) => setLessonForm({...lessonForm, videoUrl: url})} />
                                    {lessonForm.videoUrl && <p className="text-xs text-green-600 mt-1">Video Attached!</p>}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={addLesson} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Save Lesson</button>
                                <button onClick={() => setActiveModuleId(null)} className="text-gray-500 px-4 py-2">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Add Module Button */}
        {!showModuleForm ? (
            <button onClick={() => setShowModuleForm(true)} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-500 mt-6 flex justify-center items-center gap-2">
                <Plus size={20}/> Add New Module
            </button>
        ) : (
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border space-y-4">
                <input autoFocus className="w-full border p-3 rounded-lg text-lg" placeholder="Module Title (e.g. Introduction)" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} />
                <div className="flex gap-2">
                    <button onClick={addModule} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold">Create Module</button>
                    <button onClick={() => setShowModuleForm(false)} className="text-gray-500 px-4">Cancel</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}