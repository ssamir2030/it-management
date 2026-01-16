'use client'

import { useState } from 'react'
import { TROUBLESHOOT_DATA, TroubleshootNode } from '@/lib/troubleshooter-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RotateCcw, Wrench, CheckCircle, Ticket, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function TroubleshooterWizard() {
    const [history, setHistory] = useState<string[]>(['root'])
    const currentNodeId = history[history.length - 1]
    const currentNode = TROUBLESHOOT_DATA[currentNodeId]

    const handleOptionClick = (nextNodeId?: string, action?: string) => {
        if (nextNodeId) {
            setHistory(prev => [...prev, nextNodeId])
        } else if (action === 'OPEN_TICKET' || action === 'OPEN_TICKET_INK' || action === 'OPEN_TICKET_ERP') {
            // In a real app, we might redirect with pre-filled query params
            // For now, we handle this state in the render
        }
    }

    const handleBack = () => {
        if (history.length > 1) {
            setHistory(prev => prev.slice(0, -1))
        }
    }

    const handleReset = () => {
        setHistory(['root'])
    }

    // Helper to render leaf node (Solution or Action) logic is slightly mixed in the click handler
    // We need to check if the *clicked option* led to a solution, but the current structure
    // puts the solution/nextId on the option itself. 
    // The wizard displays the *current node's* question and options.
    // If an option has a 'solution' property, selecting it should probably show that solution state.
    // My updated logic:
    // If an option has `solution`, we treat it as navigating to a "result node".
    // Since my data structure puts `solution` on the option, I need a state to show the solution.

    const [selectedSolution, setSelectedSolution] = useState<{ text: string, action?: string } | null>(null)

    const handleOptionSelect = (option: any) => {
        if (option.solution) {
            setSelectedSolution({ text: option.solution, action: option.action })
        } else if (option.nextNodeId) {
            setHistory(prev => [...prev, option.nextNodeId])
        } else if (option.action) {
            // Direct action without text, e.g. "Open Ticket"
            window.location.href = '/portal/requests/new'
        }
    }

    const handleBackFromSolution = () => {
        setSelectedSolution(null)
    }

    if (selectedSolution) {
        return (
            <Card className="border-2 border-green-100 dark:border-green-900 overflow-hidden">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">الحل المقترح</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mb-8">
                        {selectedSolution.text}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <Button
                            variant="outline"
                            className="flex-1 border-green-200 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900"
                            onClick={handleBackFromSolution}
                        >
                            <ArrowRight className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={handleReset}
                        >
                            <RotateCcw className="ml-2 h-4 w-4" />
                            ابدأ من جديد
                        </Button>
                        <Link href="/portal/requests/new" className="flex-1">
                            <Button variant="ghost" className="w-full text-slate-500 hover:text-blue-600">
                                لم ينجح الحل؟
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="min-h-[400px] flex flex-col shadow-lg border-slate-200 dark:border-slate-800 relative overflow-hidden">
            {/* Progress Bar (Simple) */}
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(history.length / 5) * 100}%` }} // Approximate progress
                />
            </div>

            <CardContent className="flex-1 flex flex-col justify-center p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentNode.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 mb-2">
                                <Wrench className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-snug">
                                {currentNode.question}
                            </h2>
                        </div>

                        <div className="grid gap-3 max-w-xl mx-auto">
                            {currentNode.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    className={cn(
                                        "w-full p-4 rounded-xl text-right border-2 border-slate-100 dark:border-slate-800",
                                        "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10",
                                        "transition-all duration-200 flex items-center justify-between group"
                                    )}
                                >
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{option.label}</span>
                                    <ChevronLeft className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            {/* Footer Navigation */}
            {history.length > 1 && (
                <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                    <Button variant="ghost" onClick={handleBack} className="text-slate-500">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        السابق
                    </Button>
                    <Button variant="ghost" onClick={handleReset} className="text-slate-500 hover:text-red-500">
                        <RotateCcw className="ml-2 h-4 w-4" />
                        إعادة البدء
                    </Button>
                </div>
            )}
        </Card>
    )
}
