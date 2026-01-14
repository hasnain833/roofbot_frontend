'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';


export default function ChatbotTemplateSettings() {
  type Question = {
    key: string;        // internal key (damage_type)
    question: string;  // what bot asks
    required: boolean;
  };

  const { token } = useAuth();
  const [company, setCompany] = useState(''); // <- store company name
  const [chatbotPrompt, setChatbotPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/settings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setCompany(data.data.company || 'Your Company');
        setChatbotPrompt(data.data.chatbot_prompt || '');
        setQuestions(data.data.chatbot_questions || []);

      } catch (err) {
        console.error(err);
        setError('Failed to load settings');
      }
    };
    fetchSettings();
  }, [token]);
  const DEFAULT_PROMPT = `Act as a friendly and efficient intake assistant for ${company} Roofing Company. Your job is to collect customer details naturally, one piece at a time.`;
  const handleUpdate = async () => {
    if (!token) return setError('Token missing. Please re-login.');
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/settings`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatbot_prompt: chatbotPrompt,
            chatbot_questions: questions,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update settings');
      setSuccess('Chatbot template updated successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!token) return setError('Token missing. Please re-login.');
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/settings`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');
      setChatbotPrompt('');
      setSuccess('Custom prompt deleted. Default will be used.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Chatbot Template Settings</h1>{' '}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {' '}
          <AlertTitle>{error}</AlertTitle>{' '}
        </Alert>
      )}{' '}
      {success && (
        <Alert className="bg-green-100 border-green-400 text-green-700 mb-4">
          {' '}
          <AlertTitle>{success}</AlertTitle>{' '}
        </Alert>
      )}{' '}
      <Card className="shadow-lg border rounded-xl mb-6">
        {' '}
        <CardHeader>
          {' '}
          <h2 className="font-semibold text-lg">Default Prompt</h2>{' '}
        </CardHeader>{' '}
        <CardContent>
          {' '}
          <pre className="p-3  border rounded-md whitespace-pre-wrap text-sm">
            {' '}
            {DEFAULT_PROMPT}{' '}
          </pre>{' '}
        </CardContent>{' '}
      </Card>{' '}
      <Card className="shadow-lg border rounded-xl">
        {' '}
        <CardHeader>
          {' '}
          <h2 className="font-semibold text-lg">Custom Prompt</h2>{' '}
        </CardHeader>{' '}
        <CardContent className="flex flex-col gap-4">
          {' '}
          <textarea
            className="w-full border p-3 rounded-md h-64"
            value={chatbotPrompt}
            onChange={(e) => setChatbotPrompt(e.target.value)}
            placeholder="Add your custom chatbot prompt here..."
          />{' '}
          <div className="flex gap-3">

            <Button
              onClick={handleDelete}
              disabled={loading || !chatbotPrompt}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {' '}
              Delete{' '}
            </Button>{' '}
          </div>{' '}
        </CardContent>{' '}
      </Card>{' '}
      <Card className="shadow-lg border rounded-xl mt-6">
        <CardHeader>
          <h2 className="font-semibold text-lg">Custom Questions</h2>
          <p className="text-sm text-gray-500">
            These questions will be asked after lead details are collected(Before Appointment Booking).
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 space-y-4 "
            >
              {/* Internal Key */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Internal Key
                </label>
                <input
                  className="border rounded-md p-2"
                  placeholder="e.g. damage_type"
                  value={q.key}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[idx].key = e.target.value;
                    setQuestions(copy);
                  }}
                />
              </div>

              {/* Question Text */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Question to Ask
                </label>
                <input
                  className="border rounded-md p-2"
                  placeholder="What type of damage do you have?"
                  value={q.question}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[idx].question = e.target.value;
                    setQuestions(copy);
                  }}
                />
              </div>

              {/* Required Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[idx].required = e.target.checked;
                    setQuestions(copy);
                  }}
                />
                <span className="text-sm text-gray-700">
                  This question is required
                </span>
              </div>

              {/* Remove Button */}
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setQuestions(questions.filter((_, i) => i !== idx))
                  }
                >
                  Remove Question
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setQuestions([...questions, { key: '', question: '', required: true }])
            }
          >
            + Add Question
          </Button>
        </CardContent>

      </Card>
      {' '}
      <Button
        onClick={handleUpdate}
        disabled={loading}
        className=" hover:bg-gray-800  flex items-center mt-8"
      >
        {' '}
        {loading ? 'Saving...' : 'Save'}{' '}
      </Button>{' '}
    </div>
  );
}
