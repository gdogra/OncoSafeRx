import React, { useState } from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { Download, Printer, Share2, ZoomIn, ZoomOut, RotateCw, Search, BookOpen, Star, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const NutritionDuringTreatmentPDF: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showOutline, setShowOutline] = useState(true);
  const totalPages = 24;

  const zoomIn = () => setZoomLevel(Math.min(zoomLevel + 25, 200));
  const zoomOut = () => setZoomLevel(Math.max(zoomLevel - 25, 50));

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Nutrition During Cancer Treatment' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Outline Sidebar */}
        {showOutline && (
          <div className="lg:col-span-1">
            <Card className="p-4 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Document Outline</h3>
                <button
                  onClick={() => setShowOutline(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { section: 'Introduction', page: 1 },
                  { section: 'Understanding Nutritional Needs', page: 3 },
                  { section: 'Managing Treatment Side Effects', page: 7 },
                  { section: 'Meal Planning Strategies', page: 12 },
                  { section: 'Recipes and Ideas', page: 16 },
                  { section: 'Supplements and Vitamins', page: 20 },
                  { section: 'Resources and Support', page: 23 }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(item.page)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      currentPage >= item.page && (index === 6 || currentPage < (index < 6 ? [3, 7, 12, 16, 20, 23][index + 1] : totalPages + 1))
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{item.section}</span>
                      <span className="text-gray-400">{item.page}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Main PDF Viewer */}
        <div className={`${showOutline ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4`}>
          {/* Document Header */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nutrition During Cancer Treatment</h1>
                <p className="text-gray-600 mt-1">Comprehensive guide to maintaining nutrition throughout your treatment journey</p>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>20 min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>1,800 views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.7 rating</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download PDF
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <Printer className="w-4 h-4 inline mr-2" />
                  Print
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4 inline mr-2" />
                  Share
                </button>
              </div>
            </div>
          </Card>

          {/* PDF Viewer Controls */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {!showOutline && (
                  <button
                    onClick={() => setShowOutline(true)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Outline
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={zoomOut}
                    disabled={zoomLevel === 50}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">{zoomLevel}%</span>
                  <button
                    onClick={zoomIn}
                    disabled={zoomLevel === 200}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                  <RotateCw className="w-4 h-4" />
                </button>
                <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* PDF Preview */}
          <Card className="overflow-hidden">
            <div className="bg-gray-100 p-8">
              <div 
                className="bg-white shadow-lg mx-auto transition-all duration-200"
                style={{ 
                  width: `${Math.min(100, zoomLevel)}%`,
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center'
                }}
              >
                <div className="aspect-[8.5/11] border border-gray-300">
                  {/* Sample PDF Content based on current page */}
                  {currentPage === 1 && (
                    <div className="p-8 h-full flex flex-col">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          Nutrition During Cancer Treatment
                        </h1>
                        <p className="text-lg text-gray-600 mb-2">
                          A Comprehensive Guide to Maintaining Your Health
                        </p>
                        <p className="text-sm text-gray-500">
                          Published by OncoSafeRx Clinical Team
                        </p>
                      </div>
                      
                      <div className="flex-1 space-y-6">
                        <div className="border-t border-gray-200 pt-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Inside</h2>
                          <ul className="space-y-3 text-gray-700">
                            <li>• Understanding how treatment affects nutrition</li>
                            <li>• Practical strategies for common side effects</li>
                            <li>• Meal planning and preparation tips</li>
                            <li>• 20+ easy recipes and snack ideas</li>
                            <li>• Supplement guidelines and safety</li>
                            <li>• Resources for ongoing support</li>
                          </ul>
                        </div>

                        <div className="bg-blue-50 p-4 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Important:</strong> This guide provides general nutritional information. 
                            Always consult with your healthcare team before making significant dietary changes 
                            during treatment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentPage > 1 && (
                    <div className="p-8 h-full">
                      <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                        <span>Nutrition During Cancer Treatment</span>
                        <span>Page {currentPage}</span>
                      </div>
                      
                      {currentPage <= 6 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Understanding Nutritional Needs
                          </h2>
                          <div className="space-y-4 text-gray-700">
                            <p>
                              During cancer treatment, your body has increased nutritional needs to help 
                              maintain strength, support healing, and manage side effects. This section 
                              covers the fundamentals of nutrition during treatment.
                            </p>
                            
                            <h3 className="text-lg font-medium text-gray-900 mt-6 mb-2">
                              Key Nutritional Priorities
                            </h3>
                            <ul className="space-y-2 ml-4">
                              <li>• Adequate protein for tissue repair and immune function</li>
                              <li>• Sufficient calories to maintain energy and weight</li>
                              <li>• Hydration to support kidney function and reduce fatigue</li>
                              <li>• Essential vitamins and minerals for overall health</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {currentPage > 6 && currentPage <= 11 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Managing Treatment Side Effects
                          </h2>
                          <div className="space-y-4 text-gray-700">
                            <p>
                              Common treatment side effects can impact your ability to eat and absorb nutrients. 
                              Here are strategies to manage the most frequent challenges:
                            </p>
                            
                            <div className="bg-gray-50 p-4 rounded">
                              <h4 className="font-medium text-gray-900 mb-2">Nausea and Vomiting</h4>
                              <ul className="text-sm space-y-1">
                                <li>• Eat small, frequent meals throughout the day</li>
                                <li>• Try ginger tea or ginger candies</li>
                                <li>• Avoid strong smells and greasy foods</li>
                                <li>• Stay hydrated with clear fluids</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentPage > 11 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Sample Content - Page {currentPage}
                          </h2>
                          <p className="text-gray-700">
                            This represents the content that would appear on page {currentPage} of the 
                            comprehensive nutrition guide. The full PDF contains detailed information, 
                            recipes, meal plans, and practical tips for maintaining nutrition during treatment.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Access Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Reference</h3>
              <p className="text-sm text-gray-600 mb-3">Key tips and guidelines</p>
              <button className="text-blue-600 text-sm hover:underline">
                Jump to page 23
              </button>
            </Card>
            
            <Card className="p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Recipe Collection</h3>
              <p className="text-sm text-gray-600 mb-3">Easy meal ideas</p>
              <button className="text-blue-600 text-sm hover:underline">
                Jump to page 16
              </button>
            </Card>
            
            <Card className="p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Shopping Lists</h3>
              <p className="text-sm text-gray-600 mb-3">Downloadable lists</p>
              <button className="text-blue-600 text-sm hover:underline">
                Download separately
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDuringTreatmentPDF;