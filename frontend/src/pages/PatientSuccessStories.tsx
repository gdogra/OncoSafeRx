import React, { useState } from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { Clock, User, Tag, ChevronDown, ChevronUp, Quote, Heart } from 'lucide-react';
import FeedbackModal from '../components/Feedback/FeedbackModal';

const PatientSuccessStories: React.FC = () => {
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const toggleStory = (index: number) => {
    setExpandedStory(expandedStory === index ? null : index);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Patient Success Stories' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Success Stories</h1>
        <p className="text-gray-600 mt-1">Real-world experiences from patients navigating treatment and recovery.</p>
      </div>

      <div className="space-y-6">
        {/* Story 1 */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Managing side effects during chemotherapy</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" /> <span>Alex R.</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4" /> <span>Side Effects</span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" /> <span>3 min read</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700">
              From nausea and fatigue to changes in appetite, chemotherapy can be hard on daily life. Here's how I learned to manage side effects and maintain some normalcy during treatment.
            </p>

            {expandedStory === 1 && (
              <div className="space-y-4 text-gray-700">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <Quote className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="italic text-blue-800">"The hardest part wasn't the physical symptoms—it was feeling like I had lost control over my own body. Learning to work with the side effects instead of fighting them changed everything."</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">My Approach to Nausea</h4>
                  <p className="mb-3">The anti-nausea medications were helpful, but I discovered some additional strategies that made a real difference:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Ginger everything:</strong> Ginger tea, ginger candies, even ginger aromatherapy. I kept ginger products everywhere—in my car, at work, by my bed.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Small, frequent meals:</strong> Instead of three big meals, I ate something small every 2-3 hours. Crackers, toast, bananas—simple foods became my allies.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Cold foods over hot:</strong> The smells from hot food were often triggers. Cold smoothies, yogurt, and sandwiches were much easier to tolerate.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fatigue Management</h4>
                  <p className="mb-3">The fatigue was unlike anything I'd experienced before—not just tired, but completely drained. Here's what helped:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Energy scheduling:</strong> I learned to identify my "good hours" (usually mid-morning) and planned important activities then.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>20-minute power naps:</strong> Short naps were refreshing; longer ones made me feel worse. I set a timer every time.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Gentle movement:</strong> Even a 5-minute walk around the block helped more than lying in bed all day.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication with My Care Team</h4>
                  <p>I learned that detailed communication was key. I started keeping a daily symptom diary with:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Severity of symptoms (1-10 scale)</li>
                    <li>• What I ate and when</li>
                    <li>• Sleep quality</li>
                    <li>• Any new symptoms</li>
                  </ul>
                  <p className="mt-3">This helped my doctor adjust my medications and gave me a sense of agency in my treatment.</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Key Takeaway</h4>
                  </div>
                  <p className="text-green-800">Side effects are challenging, but they're manageable with the right strategies and support. Don't hesitate to try different approaches—what works for one person might not work for another, and that's okay. The goal is finding what works for you.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => toggleStory(1)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>{expandedStory === 1 ? 'Read less' : 'Read full story'}</span>
              {expandedStory === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </Card>

        {/* Story 2 */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Finding support networks that work</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" /> <span>Priya S.</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4" /> <span>Community</span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" /> <span>4 min read</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700">
              Whether in-person groups, online communities, or 1:1 peer connections, support can look different for everyone. Here's how I found the right support network for my personality and schedule.
            </p>

            {expandedStory === 2 && (
              <div className="space-y-4 text-gray-700">
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <Quote className="w-5 h-5 text-purple-600 mb-2" />
                  <p className="italic text-purple-800">"I thought I was the type of person who preferred to handle things alone. Cancer taught me that even introverts need support—we just need to find it in ways that feel authentic to us."</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Trial and Error with Support Groups</h4>
                  <p className="mb-3">My first attempt at support was a traditional in-person group at the hospital. While the people were wonderful, I quickly realized it wasn't for me:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>The scheduled times conflicted with my treatment schedule and fatigue patterns</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>As an introvert, sharing personal details in a large group felt overwhelming</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Different cancer types and stages meant our experiences varied significantly</span>
                    </li>
                  </ul>
                  <p className="mt-3">Instead of giving up on support entirely, I decided to try different approaches.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Online Communities: A Better Fit</h4>
                  <p className="mb-3">I discovered online forums specifically for my type of cancer. This was a game-changer:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>24/7 availability:</strong> When I couldn't sleep at 3 AM due to anxiety, someone was always there</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Specific expertise:</strong> People with similar diagnoses could share relevant experiences and resources</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Anonymity option:</strong> I could share as much or as little as I wanted, with the option to use a username</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Global perspective:</strong> I connected with people from different countries and healthcare systems</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">One-on-One Connections</h4>
                  <p className="mb-3">Through the online community, I connected with two people who became my closest cancer companions:</p>
                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 mb-3">
                    <p><strong>Sarah (similar diagnosis, 6 months ahead in treatment):</strong> She became my "treatment preview" person—helping me know what to expect and prepare for upcoming phases.</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p><strong>Michael (similar age and lifestyle):</strong> We focused more on the practical aspects—work accommodations, explaining cancer to kids, maintaining relationships during treatment.</p>
                  </div>
                  <p className="mt-3">We moved our conversations to private messages and eventually video calls. Having just one or two people who truly understood made all the difference.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Family and Friends: Setting Boundaries</h4>
                  <p className="mb-3">I learned that existing relationships needed intentional management during cancer:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Designated updater:</strong> I asked my sister to be the point person for family updates, saving me from repeating information</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Energy protection:</strong> I gave myself permission to limit visits on bad days without guilt</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Specific asks:</strong> Instead of "let me know if you need anything," I learned to make specific requests like "can you pick up groceries Tuesday?"</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">What I Learned</h4>
                  </div>
                  <p className="text-green-800">Support doesn't have to look the way you think it "should." Whether it's online communities, one-on-one relationships, or professional counseling, the best support is the kind you'll actually use. Don't be afraid to try different approaches until you find what fits your personality and circumstances.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => toggleStory(2)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <span>{expandedStory === 2 ? 'Read less' : 'Read full story'}</span>
              {expandedStory === 2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </Card>

        {/* Story 3 */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Returning to everyday life after treatment</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" /> <span>Jordan M.</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4" /> <span>Recovery</span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" /> <span>3 min read</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700">
              The transition after treatment can be emotional and complex. Here's how I paced my return to work, rebuilt my energy, and navigated follow-up care—while celebrating milestones along the way.
            </p>

            {expandedStory === 3 && (
              <div className="space-y-4 text-gray-700">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <Quote className="w-5 h-5 text-green-600 mb-2" />
                  <p className="italic text-green-800">"Everyone told me I should be thrilled that treatment was over, and I was. But I was also terrified, exhausted, and unsure who I was now. Recovery isn't just about your body—it's about rebuilding your entire sense of self."</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">The Unexpected Challenge of "Survivorship"</h4>
                  <p className="mb-3">Completing treatment felt like crossing a finish line, but I quickly realized it was more like the start of a new race. Nobody had prepared me for:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Scanxiety:</strong> The anxiety before each follow-up scan was intense</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Lingering fatigue:</strong> My energy wasn't the same as before cancer</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Identity shift:</strong> I wasn't sure how to be a "normal person" again</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Fear of recurrence:</strong> Every ache or pain made me worry</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gradual Return to Work</h4>
                  <p className="mb-3">I was eager to get back to "normal," but my body and mind needed a different timeline:</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-3">
                    <h5 className="font-semibold mb-2">Month 1-2 Post-Treatment:</h5>
                    <p>Started with 2-3 hours per day from home. Even this felt overwhelming sometimes, but it helped me ease back into mental work and social interaction.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-3">
                    <h5 className="font-semibold mb-2">Month 3-4:</h5>
                    <p>Increased to part-time (20 hours/week) with flexible scheduling. I learned to plan challenging work for my energy peaks and save administrative tasks for low-energy times.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Month 5-6:</h5>
                    <p>Returned to full-time with accommodations: work-from-home options, flexible start times, and the ability to step away for medical appointments without guilt.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rebuilding Physical Strength</h4>
                  <p className="mb-3">My relationship with exercise completely changed after cancer:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Started microscopic:</strong> 5-minute walks around the block felt like major achievements</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Found joy in gentle movement:</strong> Yoga, tai chi, and swimming became more appealing than intense cardio</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Listened to my body:</strong> Some days called for rest, and that became okay</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Celebrated small wins:</strong> Walking up two flights of stairs without being winded was worth celebrating</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Managing Follow-Up Care</h4>
                  <p className="mb-3">The transition from frequent appointments to less frequent monitoring felt strange:</p>
                  <div className="space-y-3">
                    <div className="border-l-4 border-indigo-400 pl-4">
                      <p><strong>Created a monitoring calendar:</strong> I tracked all my follow-up appointments, scans, and tests in one place to feel more in control</p>
                    </div>
                    <div className="border-l-4 border-indigo-400 pl-4">
                      <p><strong>Prepared for scan anxiety:</strong> I developed a routine for scan days—bringing headphones, a comfort item, and planning something nice afterward</p>
                    </div>
                    <div className="border-l-4 border-indigo-400 pl-4">
                      <p><strong>Stayed connected with my team:</strong> I didn't hesitate to call with questions, even if they seemed minor</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Celebrating Milestones</h4>
                  <p className="mb-3">I learned to acknowledge both big and small victories:</p>
                  <ul className="space-y-2">
                    <li>🎉 Three months post-treatment: First clear scan</li>
                    <li>🎉 Six months: Completed my first 5K walk since diagnosis</li>
                    <li>🎉 One year: Took a weekend trip without anxiety about being away from my medical team</li>
                    <li>🎉 Eighteen months: Started mentoring newly diagnosed patients</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">My New Normal</h4>
                  </div>
                  <p className="text-green-800">Recovery isn't about returning to who you were before cancer—it's about integrating this experience into who you're becoming. I'm more patient with myself, more intentional about my time, and more grateful for ordinary days. The journey continues, but now I know I can handle whatever comes next.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => toggleStory(3)}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
            >
              <span>{expandedStory === 3 ? 'Read less' : 'Read full story'}</span>
              {expandedStory === 3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </Card>
      </div>

      {/* Additional Resources */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Story</h3>
        <p className="text-gray-700 mb-4">
          Your experience could help someone else on their cancer journey. If you'd like to share your story, we'd love to hear from you.
        </p>
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Your Story
        </button>
      </div>

      {/* Story submission uses existing feedback system */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        initialType="compliment"
        initialComponent="Patient Success Stories"
      />
    </div>
  );
};

export default PatientSuccessStories;
