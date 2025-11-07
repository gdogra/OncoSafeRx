import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { FileText, Calendar, User, Target, CheckCircle, Clock, Activity, Heart, Pill, Stethoscope, AlertTriangle, Download, Edit } from 'lucide-react';
import TipCard from '../components/UI/TipCard';
import { careplanService, type CarePlanData, type CarePlanGoal, type CarePlanSection } from '../services/careplanService';
import { useToast } from '../components/UI/Toast';
import { useVisitorTracking } from '../hooks/useVisitorTracking';


const CarePlan: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { showToast } = useToast();
  const { trackEvent } = useVisitorTracking();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'goals' | 'timeline' | 'resources'>('overview');
  const [carePlanData, setCarePlanData] = useState<CarePlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarePlanData = async () => {
      try {
        setLoading(true);
        const data = await careplanService.getCarePlanData();
        setCarePlanData(data);
        
        // Track care plan view
        trackEvent('care_plan_viewed', {
          user_role: user?.role,
          tab: 'overview'
        });
      } catch (err) {
        setError('Failed to load care plan data');
        console.error('Error fetching care plan:', err);
        
        // Track error
        trackEvent('care_plan_error', {
          error: 'failed_to_load_data',
          user_role: user?.role
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCarePlanData();
    }
  }, [user, trackEvent]);

  const handleDownloadPDF = async () => {
    try {
      // Track download attempt
      trackEvent('care_plan_pdf_download_attempted', {
        user_role: user?.role
      });
      
      const pdfBlob = await careplanService.generateCarePlanPDF();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-care-plan.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('success', 'Care plan PDF downloaded successfully');
      
      // Track successful download
      trackEvent('care_plan_pdf_downloaded', {
        user_role: user?.role
      });
    } catch (err) {
      showToast('error', 'Failed to download care plan PDF');
      
      // Track download error
      trackEvent('care_plan_pdf_download_error', {
        user_role: user?.role,
        error: 'download_failed'
      });
    }
  };

  const handleRequestUpdate = async () => {
    try {
      // Track update request attempt
      trackEvent('care_plan_update_requested', {
        user_role: user?.role
      });
      
      await careplanService.requestCarePlanUpdate('Patient requesting care plan review and update');
      showToast('success', 'Update request sent to your care team');
      
      // Track successful update request
      trackEvent('care_plan_update_request_sent', {
        user_role: user?.role
      });
    } catch (err) {
      showToast('error', 'Failed to send update request');
      
      // Track update request error
      trackEvent('care_plan_update_request_error', {
        user_role: user?.role,
        error: 'request_failed'
      });
    }
  };

  // Track tab changes
  const handleTabChange = (newTab: 'overview' | 'goals' | 'timeline' | 'resources') => {
    setSelectedTab(newTab);
    
    trackEvent('care_plan_tab_changed', {
      user_role: user?.role,
      from_tab: selectedTab,
      to_tab: newTab
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Care Plan' }]} />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your care plan...</p>
        </div>
      </div>
    );
  }

  if (error || !carePlanData) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Care Plan' }]} />
        <Alert type="warning" title="Care Plan Not Available">
          {error || 'No care plan data is currently available. Please contact your healthcare provider to set up your personalized care plan.'}
        </Alert>
      </div>
    );
  }

  const carePlanSections = carePlanData.sections;
  const goals = carePlanData.goals;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'paused': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'treatment': return Stethoscope;
      case 'lifestyle': return Heart;
      case 'support': return User;
      case 'monitoring': return Activity;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'treatment': return 'bg-blue-100 text-blue-600';
      case 'lifestyle': return 'bg-green-100 text-green-600';
      case 'support': return 'bg-purple-100 text-purple-600';
      case 'monitoring': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const tabs: Array<{ id: 'overview' | 'goals' | 'timeline' | 'resources'; label: string; icon: any }> = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Heart }
  ];

  return (
    <div className="space-y-6">
      <TipCard id="tip-care-plan">
        Use the tabs to review your overall plan, goals, timeline, and resources. Track progress on goals and use “Request Update” for care team adjustments.
      </TipCard>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Care Plan' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Care Plan</h1>
          <p className="text-gray-600 mt-1">Your personalized treatment and care roadmap</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download PDF
          </button>
          <button 
            onClick={handleRequestUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 inline mr-2" />
            Request Update
          </button>
        </div>
      </div>

      {/* Care Plan Summary */}
      {carePlanData.lastUpdated && (
        <Alert type="info" title="Care Plan Last Updated">
          Your care plan was last reviewed and updated on {new Date(carePlanData.lastUpdated).toLocaleDateString()}
          {carePlanData.doctorName && ` by ${carePlanData.doctorName}`}.
          {carePlanData.reviewDate && ` Next review scheduled for ${new Date(carePlanData.reviewDate).toLocaleDateString()}.`}
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{goals.filter(g => g.status === 'active').length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Goals</p>
              <p className="text-2xl font-bold text-gray-900">{goals.filter(g => g.status === 'completed').length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Medications</p>
              <p className="text-2xl font-bold text-gray-900">{carePlanSections.find(s => s.title.toLowerCase().includes('medication'))?.items.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Appointment</p>
              <p className="text-lg font-semibold text-gray-900">{carePlanData.nextAppointment ? new Date(carePlanData.nextAppointment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not scheduled'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs" data-tour="care-plan-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group inline-flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {carePlanSections.map((section) => (
                  <Card key={section.id}>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                      <p className="text-gray-500 text-xs mt-2">Last updated: {new Date(section.lastUpdated).toLocaleDateString()}</p>
                    </div>
                    <ul className="space-y-2">
                      {section.items.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {selectedTab === 'goals' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {goals.map((goal) => {
                  const Icon = getCategoryIcon(goal.category);
                  return (
                    <Card key={goal.id}>
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${getCategoryColor(goal.category)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                              {goal.status}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{goal.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Activity className="w-4 h-4" />
                              <span>{goal.progress}% complete</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {selectedTab === 'timeline' && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Treatment Timeline</h3>
              <p className="text-gray-600 mb-4">
                Visual timeline of your treatment milestones and upcoming appointments.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View Detailed Timeline
              </button>
            </div>
          )}

          {/* Resources Tab */}
          {selectedTab === 'resources' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Care Team</h3>
                    <p className="text-gray-600 mb-4">Connect with your healthcare providers</p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      View Care Team
                    </button>
                  </div>
                </Card>

                <Card>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Resources</h3>
                    <p className="text-gray-600 mb-4">Find support groups and counseling</p>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Explore Support
                    </button>
                  </div>
                </Card>

                <Card>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Materials</h3>
                    <p className="text-gray-600 mb-4">Learn about your condition and treatment</p>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Access Resources
                    </button>
                  </div>
                </Card>

                <Card>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
                    <p className="text-gray-600 mb-4">Important numbers for urgent situations</p>
                    <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      View Contacts
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Actions</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">{carePlanData.nextAppointment ? 'Next appointment scheduled' : 'No appointments scheduled'}</p>
              <p className="text-blue-700 text-sm">{carePlanData.nextAppointment ? new Date(carePlanData.nextAppointment).toLocaleString() : 'Contact your care team to schedule'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Lab work required</p>
              <p className="text-yellow-700 text-sm">Schedule within 3 days of next treatment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{carePlanData.reviewDate ? 'Care plan review scheduled' : 'Care plan review not scheduled'}</p>
              <p className="text-green-700 text-sm">{carePlanData.reviewDate ? `${new Date(carePlanData.reviewDate).toLocaleDateString()} - discuss progress and adjustments` : 'Contact your care team to schedule review'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CarePlan;
