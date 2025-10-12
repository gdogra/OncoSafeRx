import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Heart, Brain, Waves, Timer, Star, Eye } from 'lucide-react';

const MeditationInteractive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes default
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [selectedType, setSelectedType] = useState('breathing');
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  const [breathCount, setBreathCount] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  useEffect(() => {
    if (selectedType === 'breathing' && isActive) {
      const breathingCycle = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          setBreathCount(c => c + 1);
          return 'inhale';
        });
      }, 4000); // 4 seconds per phase

      return () => clearInterval(breathingCycle);
    }
  }, [selectedType, isActive]);

  const startSession = () => {
    setIsActive(true);
    setTimeRemaining(selectedDuration * 60);
    setBreathCount(0);
  };

  const pauseSession = () => setIsActive(false);
  const resetSession = () => {
    setIsActive(false);
    setTimeRemaining(selectedDuration * 60);
    setBreathCount(0);
    setBreathPhase('inhale');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      default: return '';
    }
  };

  const getBreathingCircleClass = () => {
    if (!isActive) return 'w-32 h-32';
    switch (breathPhase) {
      case 'inhale': return 'w-40 h-40';
      case 'hold': return 'w-40 h-40';
      case 'exhale': return 'w-24 h-24';
      default: return 'w-32 h-32';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Meditation for Cancer Patients' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Meditation Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">Meditation for Cancer Patients</h1>
              <p className="text-gray-600">
                Guided mindfulness and breathing exercises designed specifically for those on their cancer journey
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>Customizable sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>1,250 users</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 rating</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Meditation Display */}
          <Card className="p-8">
            <div className="text-center space-y-8">
              {/* Timer Display */}
              <div className="text-6xl font-bold text-gray-900 font-mono">
                {formatTime(timeRemaining)}
              </div>

              {/* Breathing Circle */}
              {selectedType === 'breathing' && (
                <div className="flex flex-col items-center space-y-6">
                  <div 
                    className={`${getBreathingCircleClass()} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 transition-all duration-4000 ease-in-out flex items-center justify-center`}
                  >
                    <div className="text-white font-medium text-lg">
                      {isActive && (
                        <div className="text-center">
                          <div>{getBreathInstruction()}</div>
                          <div className="text-sm opacity-80 mt-1">Cycle {breathCount}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <div className="text-lg text-gray-700 font-medium">
                      {getBreathInstruction()}
                    </div>
                  )}
                </div>
              )}

              {/* Progressive Relaxation Visual */}
              {selectedType === 'progressive' && (
                <div className="space-y-4">
                  <div className="text-lg text-gray-700 font-medium">
                    {isActive ? 'Focus on relaxing each part of your body...' : 'Progressive Muscle Relaxation'}
                  </div>
                  <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                    {['Head', 'Shoulders', 'Arms', 'Chest', 'Abdomen', 'Legs'].map((part, index) => (
                      <div 
                        key={part}
                        className={`p-3 rounded text-sm ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} transition-colors`}
                      >
                        {part}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mindfulness Visual */}
              {selectedType === 'mindfulness' && (
                <div className="space-y-6">
                  <div className="text-lg text-gray-700 font-medium">
                    {isActive ? 'Notice your thoughts without judgment...' : 'Mindful Awareness'}
                  </div>
                  <div className="flex justify-center">
                    <div className={`w-24 h-24 rounded-full border-4 border-indigo-300 ${isActive ? 'animate-pulse' : ''}`}>
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                {!isActive ? (
                  <button
                    onClick={startSession}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Session</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseSession}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </button>
                )}
                
                <button
                  onClick={resetSession}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Session Settings */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Session Settings
            </h3>
            
            <div className="space-y-4">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10, 15, 20, 30].map(duration => (
                    <button
                      key={duration}
                      onClick={() => {
                        setSelectedDuration(duration);
                        setTimeRemaining(duration * 60);
                      }}
                      disabled={isActive}
                      className={`p-2 text-sm rounded border transition-colors ${
                        selectedDuration === duration
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Meditation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'breathing', name: 'Breathing Exercise', icon: Waves },
                    { id: 'progressive', name: 'Progressive Relaxation', icon: Heart },
                    { id: 'mindfulness', name: 'Mindful Awareness', icon: Brain }
                  ].map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        disabled={isActive}
                        className={`w-full p-3 text-left rounded border transition-colors ${
                          selectedType === type.id
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">{type.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audio Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Sound
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 w-8">{isMuted ? 0 : volume}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Benefits for Cancer Patients</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Reduces anxiety and stress</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Improves sleep quality</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Helps manage pain</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Enhances emotional well-being</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Supports immune function</span>
              </div>
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• Find a quiet, comfortable space</p>
              <p>• Sit or lie down in a relaxed position</p>
              <p>• Close your eyes or soften your gaze</p>
              <p>• Don't worry about doing it "perfectly"</p>
              <p>• Start with shorter sessions and build up</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeditationInteractive;