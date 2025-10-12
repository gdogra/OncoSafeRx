import React, { useState } from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Clock, Eye, Star, BookOpen, Download } from 'lucide-react';

const ChemoSideEffectsVideo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Managing Chemotherapy Side Effects' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <div className="relative bg-gray-900 aspect-video">
              {/* Placeholder Video Player */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                <div className="text-center text-white">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </div>
                  <p className="text-lg font-medium">Managing Chemotherapy Side Effects</p>
                  <p className="text-blue-200 mt-1">Expert guidance from oncology professionals</p>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={togglePlay}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-1" />
                      )}
                    </button>
                    <button 
                      onClick={toggleMute}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <span className="text-sm">2:35 / 15:24</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded transition-colors">
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 w-full bg-white/20 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: '17%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Video Info */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Managing Chemotherapy Side Effects</h1>
                <p className="text-gray-600 mt-2">
                  Learn practical strategies to manage common chemotherapy side effects including nausea, 
                  fatigue, hair loss, and changes in appetite. Expert advice from oncology nurses and 
                  patient experiences to help you feel more prepared and in control.
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>15 minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>3,200 views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 rating</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  {showTranscript ? 'Hide' : 'Show'} Transcript
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Notes
                </button>
              </div>

              {showTranscript && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Video Transcript</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      <span className="text-blue-600 font-medium">[00:00]</span> Welcome to our comprehensive guide on managing chemotherapy side effects. 
                      I'm Dr. Sarah Chen, an oncology nurse with over 15 years of experience helping patients 
                      navigate their treatment journey.
                    </p>
                    <p>
                      <span className="text-blue-600 font-medium">[00:30]</span> Today we'll cover the most common side effects you might experience 
                      during chemotherapy and practical strategies that have helped thousands of patients feel more 
                      comfortable and in control during their treatment.
                    </p>
                    <p>
                      <span className="text-blue-600 font-medium">[01:00]</span> Let's start with nausea, which affects about 70% of chemotherapy patients. 
                      The good news is that we have many effective ways to prevent and manage nausea...
                    </p>
                    <p className="text-gray-500 italic">
                      [Transcript continues... Full transcript available with video player controls]
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chapter Navigation */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Video Chapters</h3>
            <div className="space-y-2">
              {[
                { time: '0:00', title: 'Introduction', duration: '1 min' },
                { time: '1:00', title: 'Managing Nausea', duration: '3 min' },
                { time: '4:00', title: 'Dealing with Fatigue', duration: '4 min' },
                { time: '8:00', title: 'Hair Loss and Skin Care', duration: '3 min' },
                { time: '11:00', title: 'Appetite and Nutrition', duration: '3 min' },
                { time: '14:00', title: 'When to Call Your Team', duration: '1 min' }
              ].map((chapter, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{chapter.title}</p>
                      <p className="text-xs text-gray-500">{chapter.time}</p>
                    </div>
                    <span className="text-xs text-gray-400">{chapter.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Related Resources */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Related Resources</h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Side Effect Tracking Journal',
                  type: 'PDF Download',
                  description: 'Track symptoms and medication timing'
                },
                {
                  title: 'Nutrition During Chemo',
                  type: 'Article',
                  description: 'Dietary guidelines and meal planning'
                },
                {
                  title: 'Patient Support Groups',
                  type: 'Directory',
                  description: 'Connect with others on similar journeys'
                }
              ].map((resource, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded">
                  <h4 className="text-sm font-medium text-gray-900">{resource.title}</h4>
                  <p className="text-xs text-blue-600 mt-1">{resource.type}</p>
                  <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                Share with care team
              </button>
              <button className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                Add to my library
              </button>
              <button className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                Schedule follow-up reminder
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChemoSideEffectsVideo;