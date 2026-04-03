import { Header } from '../layout/Header';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading App..." }: LoadingScreenProps) {
  return (
    <div className="page-container flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-8 -mt-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-brand rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-400 font-heading font-bold uppercase tracking-widest text-xs mt-6 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
