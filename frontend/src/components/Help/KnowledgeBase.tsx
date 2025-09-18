import React, { useState, useMemo } from 'react';
import { Search, Book, Clock, Tag, ChevronRight, PlayCircle, AlertTriangle, Dna, Shield, Settings, ArrowLeft } from 'lucide-react';
import AutoComplete, { AutoCompleteOption } from '../UI/AutoComplete';
import { knowledgeBase, searchKnowledgeBase, KnowledgeBaseArticle, KnowledgeBaseCategory } from '../../data/knowledgeBase';
import Card from '../UI/Card';

const iconMap = {
  PlayCircle: PlayCircle,
  AlertTriangle: AlertTriangle,
  Dna: Dna,
  Shield: Shield,
  Tool: Settings,
};

interface KnowledgeBaseProps {
  className?: string;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const kbOptions: AutoCompleteOption[] = useMemo(() => {
    const articleOptions: AutoCompleteOption[] = knowledgeBase.flatMap(cat =>
      cat.articles.map(a => ({
        value: a.id,
        label: a.title,
        description: `${cat.name} • ${a.tags.join(', ')}`,
        category: cat.name,
        metadata: a,
      }))
    );
    return articleOptions;
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchKnowledgeBase(searchQuery);
  }, [searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedArticle(null);
    setSearchQuery('');
  };

  const handleArticleSelect = (article: KnowledgeBaseArticle) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-5 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  // Article view
  if (selectedArticle) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Knowledge Base</span>
          </button>
          
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{selectedArticle.estimatedReadTime} min read</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedArticle.difficulty)}`}>
                {selectedArticle.difficulty}
              </span>
              <span>Updated {selectedArticle.lastUpdated}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {selectedArticle.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Card className="prose max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: `<p class="mb-4">${formatContent(selectedArticle.content)}</p>` 
            }}
          />
        </Card>
      </div>
    );
  }

  // Category view
  if (selectedCategory) {
    const category = knowledgeBase.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            {React.createElement(iconMap[category.icon as keyof typeof iconMap] || Book, {
              className: "w-8 h-8 text-blue-600"
            })}
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          </div>
          <p className="text-lg text-gray-600">{category.description}</p>
        </div>

        <div className="space-y-4">
          {category.articles.map((article) => (
            <Card
              key={article.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleArticleSelect(article)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.estimatedReadTime} min read</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                      {article.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {article.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
        <p className="text-lg text-gray-600">Comprehensive guides and documentation for OncoSafeRx</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <AutoComplete
          options={kbOptions}
          value={searchQuery}
          placeholder="Search the knowledge base..."
          onSelect={(opt) => {
            setSearchQuery(opt.label);
            setSelectedArticle(opt.metadata as KnowledgeBaseArticle);
          }}
          onChange={setSearchQuery}
          highlightMatches
          groupByCategory
          maxResults={12}
          minChars={1}
        />
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleArticleSelect(article)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.estimatedReadTime} min read</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                        <span>{knowledgeBase.find(cat => cat.id === article.category)?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {article.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center text-gray-500 py-8">
              <Book className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No articles found matching "{searchQuery}"</p>
              <p className="text-sm mt-2">Try different keywords or browse by category below</p>
            </Card>
          )}
        </div>
      )}

      {/* Categories */}
      {searchQuery.length < 2 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeBase.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Book;
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-md transition-shadow text-center p-6"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <IconComponent className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <div className="text-sm text-blue-600 font-medium">
                    {category.articles.length} article{category.articles.length !== 1 ? 's' : ''}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
