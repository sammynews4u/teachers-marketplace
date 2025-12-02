import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug }
  });

  if (!page) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
        <div 
          className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>
      <Footer />
    </div>
  );
}