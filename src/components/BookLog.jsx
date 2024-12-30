// src/components/BookLog.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { BookOpen, Target, CheckCircle, Calendar, Plus, Trash2 } from 'lucide-react';
import { calculateDailyGoal, calculateProgress, getDaysLeft } from '../lib/utils';

// GeneralMode Component Definition
const GeneralMode = ({ data, setData, onAddBook, onDeleteBook }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({ ...prev }));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [setData]);

  const handleBookUpdate = (index, field, value) => {
    setData(prev => {
      const newBooks = [...prev.books];
      newBooks[index] = { 
        ...newBooks[index], 
        [field]: value,
        progress: field === 'currentPage' ? 
          calculateProgress(value, newBooks[index].pages) :
          field === 'pages' ? 
            calculateProgress(newBooks[index].currentPage || 0, value) :
            newBooks[index].progress
      };
      
      const totalPages = newBooks.reduce((sum, book) => sum + (parseInt(book.pages) || 0), 0);
      const totalCurrent = newBooks.reduce((sum, book) => sum + (parseInt(book.currentPage) || 0), 0);
      
      return {
        ...prev,
        books: newBooks,
        totalPages: totalPages,
        currentPage: totalCurrent
      };
    });
  };

  const progress = calculateProgress(data.currentPage, data.totalPages);
  const daysLeft = getDaysLeft(data.targetDate);
  const dailyGoal = calculateDailyGoal(data.totalPages - data.currentPage, daysLeft);

  return (
    <Card className="border border-blue-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-blue-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Overall Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Overall Progress: {progress}%</span>
            <span>Total Pages: {data.currentPage} / {data.totalPages}</span>
          </div>
          <Progress value={progress} className="h-2 bg-blue-100" />
          
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-900" />
            <span>Daily Goal: {dailyGoal} pages</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-900" />
            <span>Days Left: {daysLeft}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-blue-900">Books</h4>
          {data.books.map((book, index) => (
            <div key={index} className="space-y-3 p-4 border border-blue-100 rounded-lg relative">
              <button
                onClick={() => onDeleteBook(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
                title="Delete book"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              
              <Input
                placeholder="Book Title"
                value={book.title}
                onChange={(e) => handleBookUpdate(index, 'title', e.target.value)}
                className="border-blue-100"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-600">Total Pages</label>
                  <Input
                    type="number"
                    placeholder="Total Pages"
                    value={book.pages || ''}
                    onChange={(e) => handleBookUpdate(index, 'pages', parseInt(e.target.value))}
                    className="border-blue-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Current Page</label>
                  <Input
                    type="number"
                    placeholder="Page left off at"
                    value={book.currentPage || ''}
                    onChange={(e) => handleBookUpdate(index, 'currentPage', parseInt(e.target.value))}
                    max={book.pages}
                    className="border-blue-100"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{book.currentPage || 0} / {book.pages || 0}</span>
                </div>
                <Progress 
                  value={calculateProgress(book.currentPage || 0, book.pages || 0)} 
                  className="h-2 bg-blue-100" 
                />
              </div>
            </div>
          ))}
          <Button 
            variant="outline" 
            onClick={onAddBook}
            className="w-full mt-4 border-blue-200 text-blue-900 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
// PriorityMode Component
const PriorityMode = ({ books, setBooks, onAddBook, onDeleteBook }) => {
    // Initialize bookStatuses from localStorage or create new if not exists
    const [bookStatuses, setBookStatuses] = useState(() => {
      const savedStatuses = localStorage.getItem('bookStatuses');
      if (savedStatuses) {
        return JSON.parse(savedStatuses);
      }
      return books.map(book => {
        const daysNeeded = book.targetDate ? getDaysLeft(book.targetDate) : 0;
        return { 
          status: null, 
          checkStates: Array(daysNeeded).fill(0)
        };
      });
    });
  
    // Save bookStatuses to localStorage whenever it changes
    useEffect(() => {
      localStorage.setItem('bookStatuses', JSON.stringify(bookStatuses));
    }, [bookStatuses]);
  
    const handleBookUpdate = (index, field, value) => {
      setBooks(books.map((book, i) => {
        if (i === index) {
          const updatedBook = { ...book, [field]: value };
          if (field === 'targetDate') {
            const daysNeeded = getDaysLeft(value);
            const newCheckStates = Array(daysNeeded).fill(0);
            setBookStatuses(prev => {
              const newStatuses = [...prev];
              newStatuses[index] = { 
                status: null, 
                checkStates: newCheckStates 
              };
              localStorage.setItem('bookStatuses', JSON.stringify(newStatuses));
              return newStatuses;
            });
          }
          return updatedBook;
        }
        return book;
      }));
    };
  
    const updateCheckState = (bookIndex, dayIndex) => {
      setBookStatuses(prev => {
        const newStatuses = [...prev];
        const currentState = newStatuses[bookIndex]?.checkStates[dayIndex] || 0;
        const newCheckStates = [...(newStatuses[bookIndex]?.checkStates || [])];
        
        // Update check state (0 -> 1 -> 2 -> 0)
        newCheckStates[dayIndex] = (currentState + 1) % 3;
        
        // Calculate new status
        const checkedCount = newCheckStates.filter(state => state === 1).length;
        const xCount = newCheckStates.filter(state => state === 2).length;
        const totalDays = newCheckStates.length;
        
        let status = null;
        if (checkedCount > 0) {
          if (checkedCount === totalDays) {
            status = 'complete';
          } else if (xCount > 0) {
            status = 'behind';
          } else {
            status = 'in progress';
          }
        } else if (xCount > 0) {
          status = 'behind';
        }
  
        // Update the status for this book
        newStatuses[bookIndex] = {
          checkStates: newCheckStates,
          status
        };
  
        // Save to localStorage before returning
        localStorage.setItem('bookStatuses', JSON.stringify(newStatuses));
        return newStatuses;
      });
    };
  
    // Clean up bookStatuses when a book is deleted
    useEffect(() => {
      if (bookStatuses.length > books.length) {
        const newStatuses = bookStatuses.slice(0, books.length);
        setBookStatuses(newStatuses);
        localStorage.setItem('bookStatuses', JSON.stringify(newStatuses));
      }
    }, [books.length, bookStatuses.length]);
  
    return (
      <div className="space-y-4">
        {books.map((book, bookIndex) => {
          const daysLeft = book.targetDate ? getDaysLeft(book.targetDate) : 0;
          const dailyPages = book.totalPages ? Math.ceil(book.totalPages / daysLeft) : 0;
          const status = bookStatuses[bookIndex]?.status;
          const checkStates = bookStatuses[bookIndex]?.checkStates || [];
          
          return (
            <Card key={bookIndex} className="relative border border-blue-100">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-8">
                    <Input
                      placeholder="Book Title"
                      value={book.title}
                      onChange={(e) => handleBookUpdate(bookIndex, 'title', e.target.value)}
                      className="border-blue-100"
                    />
                  </div>
                  <button
                    onClick={() => onDeleteBook(bookIndex)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                    title="Delete book"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Total Pages"
                    value={book.totalPages || ''}
                    onChange={(e) => handleBookUpdate(bookIndex, 'totalPages', parseInt(e.target.value))}
                    className="border-blue-100"
                  />
                  <Input
                    type="date"
                    value={book.targetDate}
                    onChange={(e) => handleBookUpdate(bookIndex, 'targetDate', e.target.value)}
                    className="border-blue-100"
                  />
                </div>

                {book.targetDate && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-900" />
                        <span className="text-sm font-medium">Daily Goal: {dailyPages} pages</span>
                      </div>
                      <div className="text-sm">
                        Status: {status ? 
                          <span className={`font-medium ${
                            status === 'complete' ? 'text-green-500' :
                            status === 'behind' ? 'text-red-500' :
                            'text-blue-900'
                          }`}>
                            {status}
                          </span> : 'Not Started'
                        }
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-blue-900">Daily Progress</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {checkStates.map((state, dayIndex) => (
                          <div key={dayIndex} className="text-center w-6">
                            <button
                              onClick={() => updateCheckState(bookIndex, dayIndex)}
                              className={`w-6 h-6 rounded border ${
                                state === 1 ? 'bg-green-500 text-white border-green-500' :
                                state === 2 ? 'bg-red-500 text-white border-red-500' :
                                'border-blue-200'
                              } flex items-center justify-center hover:opacity-90 mb-2`}
                            >
                              {state === 1 ? '✓' : state === 2 ? '✕' : ''}
                            </button>
                            <div className="text-xs mb-1">Day {dayIndex + 1}</div>
                            <div className="text-xs font-medium">{dailyPages} pages</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        <Button 
          variant="outline" 
          onClick={onAddBook}
          className="w-full mt-4 border-blue-200 text-blue-900 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>
    );
  };

  // Main BookLog Component
const BookLog = () => {
    // Initialize state with data from localStorage if it exists
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('readingMode');
        return savedMode || 'general';
    });

    const [generalBooks, setGeneralBooks] = useState(() => {
        const saved = localStorage.getItem('generalBooks');
        return saved ? JSON.parse(saved) : null;
    });

    const [priorityBooks, setPriorityBooks] = useState(() => {
        const saved = localStorage.getItem('priorityBooks');
        return saved ? JSON.parse(saved) : null;
    });

    const [numBooks, setNumBooks] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Save data whenever it changes
    useEffect(() => {
        localStorage.setItem('readingMode', mode);
    }, [mode]);

    useEffect(() => {
        if (generalBooks) {
            localStorage.setItem('generalBooks', JSON.stringify(generalBooks));
        }
    }, [generalBooks]);

    useEffect(() => {
        if (priorityBooks) {
            localStorage.setItem('priorityBooks', JSON.stringify(priorityBooks));
        }
    }, [priorityBooks]);

    const handleGeneralSetup = () => {
        const count = parseInt(numBooks);
        if (count > 0 && targetDate) {
            const newGeneralBooks = {
                totalBooks: count,
                targetDate: targetDate,
                totalPages: 0,
                currentPage: 0,
                books: Array(count).fill().map(() => ({
                    title: '',
                    pages: 0,
                    currentPage: 0,
                    progress: 0
                }))
            };
            setGeneralBooks(newGeneralBooks);
            localStorage.setItem('generalBooks', JSON.stringify(newGeneralBooks));
            setIsEditing(false);
        }
    };

    const handlePrioritySetup = () => {
        const count = parseInt(numBooks);
        if (count > 0) {
            const newPriorityBooks = Array(count).fill().map(() => ({
                title: '',
                totalPages: 0,
                currentPage: 0,
                targetDate: '',
                dailyProgress: [],
                isComplete: false
            }));
            setPriorityBooks(newPriorityBooks);
            localStorage.setItem('priorityBooks', JSON.stringify(newPriorityBooks));
            setIsEditing(false);
        }
    };

    const handleBookSetup = () => {
        if (mode === 'general') {
            handleGeneralSetup();
        } else {
            handlePrioritySetup();
        }
    };

    const handleAddBook = () => {
        if (mode === 'general') {
            const updatedBooks = prev => {
                const newState = {
                    ...prev,
                    totalBooks: prev.totalBooks + 1,
                    books: [...prev.books, { title: '', pages: 0, currentPage: 0, progress: 0 }]
                };
                localStorage.setItem('generalBooks', JSON.stringify(newState));
                return newState;
            };
            setGeneralBooks(updatedBooks);
        } else {
            const updatedBooks = prev => {
                const newState = [
                    ...prev,
                    {
                        title: '',
                        totalPages: 0,
                        currentPage: 0,
                        targetDate: '',
                        dailyProgress: [],
                        isComplete: false
                    }
                ];
                localStorage.setItem('priorityBooks', JSON.stringify(newState));
                return newState;
            };
            setPriorityBooks(updatedBooks);
        }
    };

    const handleDeleteBook = (index) => {
        if (mode === 'general') {
            setGeneralBooks(prev => {
                const newBooks = prev.books.filter((_, i) => i !== index);
                if (newBooks.length === 0) {
                    localStorage.removeItem('generalBooks');
                    return null;
                }
                const totalPages = newBooks.reduce((sum, book) => sum + (parseInt(book.pages) || 0), 0);
                const totalCurrent = newBooks.reduce((sum, book) => sum + (parseInt(book.currentPage) || 0), 0);
                
                const newState = {
                    ...prev,
                    totalBooks: prev.totalBooks - 1,
                    books: newBooks,
                    totalPages,
                    currentPage: totalCurrent
                };
                localStorage.setItem('generalBooks', JSON.stringify(newState));
                return newState;
            });
        } else {
            setPriorityBooks(prev => {
                const newBooks = prev.filter((_, i) => i !== index);
                if (newBooks.length === 0) {
                    localStorage.removeItem('priorityBooks');
                    return null;
                }
                localStorage.setItem('priorityBooks', JSON.stringify(newBooks));
                return newBooks;
            });
        }
    };

    const InitialSetup = () => (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-blue-900">
            {isEditing ? 'Edit Reading Plan' : 'Setup Your Reading Plan'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Books</label>
            <Input
              type="number"
              value={numBooks}
              onChange={(e) => setNumBooks(e.target.value)}
              min="1"
              className="border-blue-100"
            />
          </div>
          {mode === 'general' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Completion Date</label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="border-blue-100"
              />
            </div>
          )}
          <Button 
            onClick={handleBookSetup} 
            className="w-full bg-blue-900 hover:bg-blue-800"
          >
            {isEditing ? 'Update Plan' : 'Create Reading Plan'}
          </Button>
        </CardContent>
      </Card>
    );
    return (
        <div className="container mx-auto p-4">
          <Tabs 
            defaultValue={mode} 
            onValueChange={(value) => {
              setMode(value);
              setNumBooks('');
              setTargetDate('');
              setIsEditing(false);
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="general">General Tracking</TabsTrigger>
              <TabsTrigger value="priority">Priority Tracking</TabsTrigger>
            </TabsList>
    
            <TabsContent value="general">
              {!generalBooks || isEditing ? (
                <InitialSetup />
              ) : (
                <GeneralMode 
                  data={generalBooks} 
                  setData={setGeneralBooks}
                  onAddBook={handleAddBook}
                  onDeleteBook={handleDeleteBook}
                />
              )}
            </TabsContent>
    
            <TabsContent value="priority">
              {!priorityBooks || isEditing ? (
                <InitialSetup />
              ) : (
                <PriorityMode 
                  books={priorityBooks} 
                  setBooks={setPriorityBooks}
                  onAddBook={handleAddBook}
                  onDeleteBook={handleDeleteBook}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      );
    }
    export default BookLog;