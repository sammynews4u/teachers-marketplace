"use client";

import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, DollarSign, Calendar, Edit2, 
  Clock, MessageSquare, Star, Video, Plus, Trash2 
} from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]); // New State
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('classroom'); // 'classroom' or 'courses'
  const [earnings, setEarnings] = useState(0);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', price: '', startDate: '', endDate: '', schedule: ''
  });
  const [showCourseForm, setShowCourseForm] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('teacherId');
    if (!id) {
      router.push('/login');
      return;
    }

    // 1. Fetch Teacher Data
    fetch('/api/teacher-dashboard', {
      method: 'POST',
      body: JSON.stringify({ teacherId: id }),
    })
    .then(res => res.json())
    .then(data => {
      setTeacher(data);
      if(data.bookings) {
        const total = data.bookings.reduce((acc: number, curr: any) => {
          return curr.type === 'trial' ? acc : acc + curr.amount;
        }, 0);
        setEarnings(total);
      }
    });

    // 2. Fetch Courses
    fetch(`/api/courses?teacherId=${id}`)
      .then(res => res.json())
      .then(data => setCourses(data));

  }, []);

  const handleUpdate = async () => {
    await fetch('/api/teacher-dashboard', {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
    setIsEditing(false);
    alert("Profile Updated Successfully!");
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/courses', {
      method: 'POST',
      body: JSON.stringify({ ...newCourse, teacherId: teacher.id }),
    });
    if (res.ok) {
      alert("Course Created!");
      setShowCourseForm(false);
      // Refresh courses
      fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if(!confirm("Delete this course?")) return;
    await fetch('/api/courses', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetch(`/api/courses?teacherId=${teacher.id}`).then(r => r.json()).then(setCourses);
  };

  if (!teacher) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{teacher.name} 👋</h1>
            <p className="text-gray-500">Manage your classroom and courses.</p>
          </div>
          <button onClick={() => { localStorage.removeItem('teacherId'); router.push('/'); }} className="text-red-500 font-medium">Log Out</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Profile */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden text-center">
               <img src={teacher.image} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-100 mb-4" />
               <h2 className="text-xl font-bold">{teacher.name}</h2>
               <p className="text-blue-600">{teacher.subject}</p>
               <p className="font-bold mt-2">₦{teacher.hourlyRate}/hr (Base)</p>
               <button onClick={() => setIsEditing(!isEditing)} className="text-sm text-gray-400 mt-4 underline">Edit Profile</button>
               
               {isEditing && (
                 <div className="mt-4 space-y-2">
                   <input value={teacher.name} onChange={e => setTeacher({...teacher, name: e.target.value})} className="border p-2 w-full rounded"/>
                   <button onClick={handleUpdate} className="bg-green-600 text-white w-full py-2 rounded">Save</button>
                 </div>
               )}
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <p className="text-gray-500 text-xs font-bold uppercase">Total Earnings</p>
               <p className="text-2xl font-bold text-green-600">₦{earnings.toLocaleString()}</p>
            </div>
          </div>

          {/* RIGHT: Content Area */}
          <div className="lg:col-span-2">
            
            {/* TABS */}
            <div className="flex gap-4 mb-6">
              <button onClick={() => setActiveTab('classroom')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'classroom' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>Classroom</button>
              <button onClick={() => setActiveTab('courses')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'courses' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>My Courses</button>
            </div>

            {/* TAB 1: CLASSROOM (Students) */}
            {activeTab === 'classroom' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                 <h3 className="font-bold text-lg mb-4">Recent Students</h3>
                 {teacher.bookings?.length === 0 ? <p className="text-gray-400">No students yet.</p> : (
                   <div className="divide-y">
                     {teacher.bookings.map((b: any) => (
                       <div key={b.id} className="py-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${b.student?.name}`} className="w-10 h-10 rounded-full bg-gray-100"/>
                           <div>
                             <p className="font-bold">{b.student?.name}</p>
                             <p className="text-xs text-gray-500">{b.type === 'trial' ? 'Free Trial' : 'Paid Student'}</p>
                           </div>
                         </div>
                         <button className="text-blue-600"><MessageSquare size={18}/></button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {/* TAB 2: COURSES (Management) */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                
                {/* Add Course Button */}
                <button 
                  onClick={() => setShowCourseForm(!showCourseForm)}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-500 transition flex justify-center items-center gap-2"
                >
                  <Plus size={20} /> Create New Cohort / Course
                </button>

                {/* Create Form */}
                {showCourseForm && (
                  <form onSubmit={handleCreateCourse} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-4">
                    <h3 className="font-bold text-lg">New Course Details</h3>
                    <input required placeholder="Course Title (e.g. Master English - Sept Cohort)" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                    <textarea required placeholder="Description" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="number" placeholder="Price (₦)" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, price: e.target.value})} />
                      <input required type="text" placeholder="Schedule (e.g. Mon/Wed 4PM)" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, schedule: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-gray-500">Start Date</label><input required type="date" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, startDate: e.target.value})} /></div>
                      <div><label className="text-xs text-gray-500">End Date</label><input required type="date" className="w-full border p-3 rounded-lg" onChange={e => setNewCourse({...newCourse, endDate: e.target.value})} /></div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Publish Course</button>
                  </form>
                )}

                {/* Course List */}
                <div className="grid gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-lg">{course.title}</h4>
                        <p className="text-gray-500 text-sm mb-2">{course.schedule}</p>
                        <div className="flex gap-4 text-xs font-bold text-gray-400">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</span>
                          <span className="text-green-600">₦{course.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCourse(course.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20}/></button>
                    </div>
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