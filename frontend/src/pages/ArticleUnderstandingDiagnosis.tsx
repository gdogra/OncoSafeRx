import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { BookOpen, Star, Clock, Tag, Eye, Info } from 'lucide-react';

const ArticleUnderstandingDiagnosis: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Understanding Your Cancer Diagnosis' },
        ]}
      />
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Understanding Your Cancer Diagnosis</h1>
          <div className="text-sm text-gray-600 flex items-center space-x-3 mt-1">
            <span>Type: ARTICLE</span>
            <span>•</span>
            <span>10 min read</span>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
              <span className="uppercase tracking-wide text-xs">Type</span> <span className="font-medium">ARTICLE</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" /> <span>10 min read</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Tag className="w-4 h-4" /> <span>treatment</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> <span>4.8</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Eye className="w-4 h-4" /> <span>2,450</span>
            </div>
          </div>

          {/* Summary */}
          <div className="text-gray-800">
            Learn about your specific type of cancer, how staging works, and what to expect during treatment and follow-up.
          </div>

          {/* Complete Article Content */}
          <div className="space-y-8 text-gray-800">
            {/* Introduction */}
            <div>
              <p className="text-base leading-relaxed">
                Receiving a cancer diagnosis can feel overwhelming, but understanding what it means puts you in a better position to participate actively in your care. This comprehensive guide will help you understand your diagnosis, what the staging information tells you, and what to expect as you move forward with treatment.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What Your Diagnosis Tells You</h3>
              <div className="space-y-4">
                <p>Your cancer diagnosis contains several key pieces of information that help your healthcare team develop the most effective treatment plan for you:</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Primary Site</h4>
                  <p>This is where your cancer started. Even if cancer has spread to other parts of your body, it's still named after where it began. For example, breast cancer that has spread to the liver is still called breast cancer, not liver cancer.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Histology (Cell Type)</h4>
                  <p>This describes what the cancer cells look like under a microscope. Different cell types may respond differently to treatments. Common types include adenocarcinoma, squamous cell carcinoma, and sarcoma.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Molecular Markers</h4>
                  <p>These are specific proteins or genetic changes found in your cancer cells. Examples include HER2 in breast cancer or PD-L1 in lung cancer. These markers can help predict which treatments will work best for you.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Grade</h4>
                  <p>This describes how abnormal the cancer cells look and how quickly they're likely to grow and spread. Grades typically range from 1 (slow-growing) to 3 or 4 (fast-growing).</p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Understanding Cancer Staging</h3>
              <div className="space-y-4">
                <p>Staging describes the extent of cancer in your body. It's one of the most important factors in determining your prognosis and treatment options.</p>
                
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-900 mb-2">The TNM System</h4>
                  <p className="text-blue-800 mb-3">Most cancers are staged using the TNM system:</p>
                  <ul className="space-y-2 text-blue-800">
                    <li><strong>T (Tumor):</strong> Size and extent of the primary tumor</li>
                    <li><strong>N (Nodes):</strong> Whether cancer has spread to nearby lymph nodes</li>
                    <li><strong>M (Metastasis):</strong> Whether cancer has spread to other parts of the body</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Stage 0</h4>
                    <p className="text-green-800">Abnormal cells are present but haven't spread to nearby tissue. Also called carcinoma in situ.</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">Stage I</h4>
                    <p className="text-yellow-800">Cancer is small and only in the area where it started.</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">Stages II & III</h4>
                    <p className="text-orange-800">Cancer is larger and may have spread to nearby tissues or lymph nodes.</p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">Stage IV</h4>
                    <p className="text-red-800">Cancer has spread to distant parts of the body.</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800"><strong>Important:</strong> Staging can sometimes change as more information becomes available through additional tests or surgery. This is called "restaging" and helps ensure you receive the most appropriate treatment.</p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Treatment Planning and What to Expect</h3>
              <div className="space-y-4">
                <p>Your treatment plan is personalized based on your specific diagnosis, stage, overall health, and personal preferences. Here's what you can expect:</p>

                <div className="space-y-4">
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Multidisciplinary Team Approach</h4>
                    <p>Your care team may include oncologists, surgeons, radiation oncologists, pathologists, radiologists, nurses, social workers, and other specialists who work together to plan your care.</p>
                  </div>

                  <div className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Treatment Modalities</h4>
                    <ul className="space-y-2">
                      <li><strong>Surgery:</strong> Removes the tumor and sometimes nearby tissue</li>
                      <li><strong>Chemotherapy:</strong> Uses drugs to destroy cancer cells throughout the body</li>
                      <li><strong>Radiation therapy:</strong> Uses high-energy beams to kill cancer cells</li>
                      <li><strong>Immunotherapy:</strong> Helps your immune system fight cancer</li>
                      <li><strong>Targeted therapy:</strong> Attacks specific cancer cell features</li>
                      <li><strong>Hormone therapy:</strong> Blocks hormones that fuel certain cancers</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Treatment Goals</h4>
                    <p>Your treatment goals might include:</p>
                    <ul className="space-y-1 mt-2">
                      <li>• <strong>Curative:</strong> Aimed at eliminating all cancer from your body</li>
                      <li>• <strong>Control:</strong> Stopping or slowing cancer growth</li>
                      <li>• <strong>Palliative:</strong> Relieving symptoms and improving quality of life</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Managing Side Effects and Monitoring</h3>
              <div className="space-y-4">
                <p>Modern cancer treatment focuses not just on fighting cancer, but on maintaining your quality of life throughout treatment.</p>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Supportive Care</h4>
                  <p className="text-green-800 mb-2">Your team will help prevent and manage side effects through:</p>
                  <ul className="space-y-1 text-green-800">
                    <li>• Medications to prevent nausea and other symptoms</li>
                    <li>• Nutritional counseling and dietary support</li>
                    <li>• Physical therapy and exercise programs</li>
                    <li>• Mental health and emotional support services</li>
                    <li>• Pain management strategies</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Regular Monitoring</h4>
                  <p className="text-indigo-800 mb-2">Throughout treatment, you'll have regular appointments to:</p>
                  <ul className="space-y-1 text-indigo-800">
                    <li>• Check how you're responding to treatment</li>
                    <li>• Monitor for side effects</li>
                    <li>• Adjust your treatment plan if needed</li>
                    <li>• Provide ongoing support and education</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions to Ask Your Healthcare Team</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-3">Don't hesitate to ask questions. Here are some important ones to consider:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">About Your Diagnosis:</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• What type of cancer do I have?</li>
                      <li>• What stage is my cancer?</li>
                      <li>• What does my prognosis look like?</li>
                      <li>• Are there genetic factors involved?</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">About Treatment:</h5>
                    <ul className="space-y-1 text-sm">
                      <li>• What are my treatment options?</li>
                      <li>• What are the potential side effects?</li>
                      <li>• How will treatment affect my daily life?</li>
                      <li>• Are there clinical trials I should consider?</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Moving Forward</h3>
              <div className="space-y-4">
                <p>Understanding your diagnosis is the first step in your cancer journey. Remember that:</p>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p>Every cancer is unique, and treatments are becoming increasingly personalized</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p>You are an important member of your healthcare team</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p>Support is available at every step of your journey</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p>It's normal to feel overwhelmed - take things one step at a time</p>
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Important Reminder</p>
                      <p>This article provides general information about cancer diagnosis and treatment. Always discuss your individual situation with your healthcare team, as they know your specific case best and can provide personalized guidance.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Related Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded border">
                  <h5 className="font-medium text-sm">Treatment Planning</h5>
                  <p className="text-xs text-gray-600 mt-1">Learn about different treatment approaches</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <h5 className="font-medium text-sm">Managing Side Effects</h5>
                  <p className="text-xs text-gray-600 mt-1">Tips for handling treatment side effects</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <h5 className="font-medium text-sm">Support Resources</h5>
                  <p className="text-xs text-gray-600 mt-1">Find emotional and practical support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArticleUnderstandingDiagnosis;
