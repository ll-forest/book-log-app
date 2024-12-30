// src/App.jsx
import React from 'react';
import BookLog from './components/BookLog';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { BookOpen } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950">
      <header className="py-12 bg-white dark:bg-blue-900 shadow-md">
        <div className="container mx-auto px-4">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <div className="text-center">
                <CardTitle className="text-3xl md:text-4xl flex items-center justify-center gap-3 text-blue-600 dark:text-blue-300">
                  <BookOpen className="h-10 w-10" />
                  Book Reading Tracker
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Track your reading progress and stay on schedule
              </p>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <BookLog />
      </main>

      <footer className="py-6 bg-white dark:bg-blue-900 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>Lectori Salutem</p>
        </div>
      </footer>
    </div>
  );
}

export default App;