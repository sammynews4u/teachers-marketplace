"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, CheckCircle, FileText, ChevronLeft, Menu } from 'lucide-react';

export default function Classroom() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // 1. Fetch Course Content
    fetch(`/api/courses/${params.courseId}/chapters`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        // Default to first lesson
        if(data.modules?.[0]?.lessons?.[0]) {
            setActiveLesson(data.modules[0].lessons[0]);
        }
      });
  }, []);

  if (!course || !activeLesson) return <div className="p-20 text-center">Loading Classroom...</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* SIDEBAR (Modules) */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex items-center gap-2">
            <button onClick={() => router.push('/student-dashboard')}><ChevronLeft/></button>
            <h2 className="font-bold text-sm truncate">{course.title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
            {course.modules.map((module: any) => (
                <div key={module.id}>
                    <div className="bg-gray-50 p-3 font-bold text-xs text-gray-500 uppercase tracking-wide border-y">{module.title}</div>
                    {module.lessons.map((lesson: any) => (
                        <div 
                            key={lesson.id} 
                            onClick={() => setActiveLesson(lesson)}
                            className={`p-4 cursor-pointer flex items-center gap-3 text-sm hover:bg-blue-50 transition ${activeLesson.id === lesson.id ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700'}`}
                        >
                            {completed.includes(lesson.id) ? <CheckCircle size={16} className="text-green-500"/> : <PlayCircle size={16}/>}
                            {lesson.title}
                        </div>
                    ))}
                </div>
            ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b p-4 flex items-center shadow-sm z-10">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 p-2 hover:bg-gray-100 rounded"><Menu/></button>
            <h1 className="font-bold text-lg">{activeLesson.title}</h1>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Video Player */}
                {activeLesson.videoUrl && (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                        <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                    </div>
                )}

                {/* Text Content */}
                <div className="prose max-w-none">
                    <h2 className="text-2xl font-bold mb-4">Lesson Notes</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{activeLesson.description}</p>
                </div>

                {/* Resources */}
                {activeLesson.resources?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={20}/> Resources</h3>
                        <div className="space-y-2">
                            {activeLesson.resources.map((res: any) => (
                                <a key={res.id} href={res.url} target="_blank" className="block text-blue-600 hover:underline">{res.name || "Download File"}</a>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>

    </div>
  );
}