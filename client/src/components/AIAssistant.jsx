import React, { useState } from 'react';
import { Sparkles, Lightbulb, AlertCircle, TrendingUp, X, Loader, Wand2 } from 'lucide-react';
import axios from 'axios';

const AIAssistant = ({ nodes, edges, onAddNode, onGenerateWorkflow }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggest'); // suggest, generate, analyze
  const [suggestion, setSuggestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Get auth token from localStorage
  const getToken = () => localStorage.getItem('token');

  const handleGetSuggestion = async () => {
    if (nodes.length === 0) {
      setError('Add at least one node first!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/suggest-next',
        { nodes, edges },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setSuggestion(response.data.suggestion);
    } catch (err) {
      setError('Failed to get suggestion. Try again!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (nodes.length === 0) {
      setError('Add at least one node first!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/analyze-workflow',
        { nodes, edges },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setAnalysis(response.data.analysis);
    } catch (err) {
      setError('Failed to analyze workflow. Try again!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (description.trim().length < 10) {
      setError('Please provide a detailed description (min 10 characters)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/generate-workflow',
        { description },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (onGenerateWorkflow) {
        onGenerateWorkflow(response.data.workflow);
        setDescription('');
        setActiveTab('suggest');
      }
    } catch (err) {
      setError('Failed to generate workflow. Try again!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion && onAddNode) {
      const newNode = {
        id: `${Date.now()}`,
        type: suggestion.nodeType,
        position: { x: 250, y: (nodes.length * 150) + 50 },
        data: {
          label: suggestion.service 
            ? `${suggestion.service} action` 
            : suggestion.suggestion,
          service: suggestion.service,
          config: suggestion.configuration || {},
        },
      };
      onAddNode(newNode);
      setSuggestion(null);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
        title="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
          AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border-2 border-purple-200 z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h3 className="font-bold text-lg">AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('suggest')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'suggest'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Lightbulb className="w-4 h-4 inline mr-1" />
          Suggest
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'generate'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Wand2 className="w-4 h-4 inline mr-1" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'analyze'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-1" />
          Analyze
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Suggest Tab */}
        {activeTab === 'suggest' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Get AI-powered suggestions for what node to add next based on your current workflow.
            </p>

            <button
              onClick={handleGetSuggestion}
              disabled={loading || nodes.length === 0}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get Suggestion
                </>
              )}
            </button>

            {suggestion && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-1">
                      {suggestion.suggestion}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      {suggestion.reasoning}
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {suggestion.nodeType}
                      </span>
                      {suggestion.service && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {suggestion.service}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleApplySuggestion}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                >
                  Add This Node
                </button>
              </div>
            )}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Describe your workflow in plain English and AI will generate it for you!
            </p>

            {/* <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Send me a daily email summary of new Google Sheets entries and post to Slack if any row has status 'urgent'"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
            /> */}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Send me a daily email summary of new Google Sheets entries and post to Slack if any row has status 'urgent'"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none bg-white text-gray-900"
            />


            <button
              onClick={handleGenerate}
              disabled={loading || description.trim().length < 10}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Workflow
                </>
              )}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 font-medium mb-1">💡 Tips for best results:</p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                <li>Be specific about what triggers the workflow</li>
                <li>Mention which services to use (Gmail, Sheets, Slack, Discord)</li>
                <li>Include conditions if needed ("if X, then do Y")</li>
              </ul>
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Get AI analysis of your workflow to find issues and optimization opportunities.
            </p>

            <button
              onClick={handleAnalyze}
              disabled={loading || nodes.length === 0}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Analyze Workflow
                </>
              )}
            </button>

            {analysis && (
              <div className="space-y-3">
                {/* Score */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Workflow Score</span>
                    <span className="text-2xl font-bold text-green-600">{analysis.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${analysis.score}%` }}
                    />
                  </div>
                </div>

                {/* Issues */}
                {analysis.issues && analysis.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Issues Found</h4>
                    {analysis.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-sm ${
                          issue.severity === 'high'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : issue.severity === 'medium'
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            : 'bg-blue-50 border-blue-200 text-blue-800'
                        }`}
                      >
                        <span className="font-medium">{issue.severity.toUpperCase()}:</span> {issue.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Suggestions</h4>
                    {analysis.suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-sm text-purple-900"
                      >
                        {sug.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-500 text-center">
          ✨ Powered by Claude AI • Your workflow assistant
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;