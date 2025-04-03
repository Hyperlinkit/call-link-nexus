
import CTIApp from '@/components/CTIApp';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="container">
          <h1 className="text-2xl font-bold text-cti-blue">Call Link Nexus</h1>
          <p className="text-sm text-gray-500">Twilio-powered call management</p>
        </div>
      </header>
      
      <main className="flex-1 py-8">
        <CTIApp />
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container text-center text-sm text-gray-500">
          <p>© 2025 Call Link Nexus - Powered by Twilio</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
