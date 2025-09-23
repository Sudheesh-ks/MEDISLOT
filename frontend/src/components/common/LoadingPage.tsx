import { Heart, Activity, Stethoscope, Shield } from 'lucide-react';
import type React from 'react';

const LoadingPage: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center overflow-hidden text-slate-100">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-green-500/10 rounded-full animate-bounce"
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-20 h-20 bg-pink-500/10 rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-28 h-28 bg-purple-500/10 rounded-full animate-bounce"
          style={{ animationDelay: '1.5s' }}
        ></div>
      </div>

      {/* Main loading container */}
      <div className="relative z-10 text-center max-w-md mx-auto p-8">
        {/* Animated medical icons */}
        <div className="relative mb-12">
          {/* Central pulsing heart */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-400/30 rounded-full animate-ping w-20 h-20 mx-auto"></div>
            <div className="relative bg-gradient-to-r from-red-500 to-pink-600 rounded-full p-5 shadow-xl">
              <Heart className="w-10 h-10 text-white animate-pulse" fill="currentColor" />
            </div>
          </div>

          {/* Orbiting icons */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-full p-3 shadow-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute top-1/2 -right-8 transform -translate-y-1/2">
              <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-full p-3 shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-full p-3 shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* App title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            Loading...
          </h1>
          <p className="text-slate-400 text-sm">Please wait</p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s',
              }}
            ></div>
          ))}
        </div>

        {/* Medical cross decoration */}
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-y-0 left-1/2 w-2 bg-red-500 transform -translate-x-1/2"></div>
            <div className="absolute inset-x-0 top-1/2 h-2 bg-red-500 transform -translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
