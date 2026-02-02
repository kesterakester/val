'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Send, Heart, ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import HeartBackground from './HeartBackground'
import { cn } from '@/lib/utils'

type QuestionType = 'text' | 'choice'

interface Question {
    text: string
    type: QuestionType
    options?: string[]
}

const QUESTIONS: Question[] = [
    {
        text: "If you could describe our connection in one word, what would it be? ✨",
        type: 'text'
    },
    {
        text: "Which of these romantic settings feels most like 'us'? 🌹",
        type: 'choice',
        options: ["Walking on a moonlit beach 🌊", "Cuddling by a warm fireplace 🔥", "Dancing under the city lights 🌃", "Picnic in a field of flowers 🌸"]
    },
    {
        text: "What is the one thing I do that makes you feel most loved? 💌",
        type: 'text'
    },
    {
        text: "If we were characters in a love story, what kind would it be? 📖",
        type: 'choice',
        options: ["A passionate fairytale 🏰", "A sweet high school romance 🎒", "An adventurous duo 🌍", "A soulful, eternal bond ♾️"]
    },
    {
        text: "What is your wish for us this Valentine's Day? 💝",
        type: 'text'
    }
]

type AppState = 'INTRO' | 'QUESTIONS' | 'MESSAGE' | 'FLAMES' | 'LOVE_CALCULATOR' | 'PROPOSAL' | 'SUCCESS'

export default function ValentineApp() {
    const [mounted, setMounted] = useState(false)
    const [state, setState] = useState<AppState>('INTRO')
    const [name, setName] = useState('')
    const [dbId, setDbId] = useState<string | null>(null)

    // Question State
    const [qIndex, setQIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [allAnswers, setAllAnswers] = useState<{ question: string; answer: string }[]>([])

    // Proposal State
    const [noCount, setNoCount] = useState(0)
    const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 })
    const [noBtnStyle, setNoBtnStyle] = useState<React.CSSProperties>({})
    const noBtnRef = useRef<HTMLButtonElement>(null)

    // FLAMES State
    const [flamesName1, setFlamesName1] = useState('')
    const [flamesName2, setFlamesName2] = useState('')
    const [flamesResult, setFlamesResult] = useState('')
    const [countdown, setCountdown] = useState(6)
    const [showTryAgain, setShowTryAgain] = useState(false)

    // Love Calculator State
    const [loveName1, setLoveName1] = useState('')
    const [loveName2, setLoveName2] = useState('')
    const [lovePercentage, setLovePercentage] = useState(0)
    const [loveMessage, setLoveMessage] = useState('')
    const [loveCountdown, setLoveCountdown] = useState(6)
    const [showLoveTryAgain, setShowLoveTryAgain] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const createSession = async (useName: string) => {
        try {
            const { data } = await supabase.from('valentine_responses').insert({
                name: useName,
                created_at: new Date().toISOString(),
                answers: [],
                yes_attempts: 0,
                no_attempts: 0,
                final_response: 'PENDING'
            }).select().single()
            if (data) setDbId(data.id)
        } catch (e) {
            console.error(e)
        }
    }

    const updateSession = async (updates: any) => {
        if (!dbId) return
        try {
            await supabase.from('valentine_responses').update(updates).eq('id', dbId)
        } catch (e) { }
    }

    const handleStart = () => {
        if (!name.trim()) return
        createSession(name)
        setState('QUESTIONS')
    }

    const [compliment, setCompliment] = useState('')
    type CardStyle = 'rose' | 'gold' | 'lavender' | 'sky' | 'peach'
    const [cardStyle, setCardStyle] = useState<CardStyle>('rose')

    const [remainingCompliments, setRemainingCompliments] = useState<string[]>([
        "You're such a sweetheart! 💖",
        "I love how you think! 🧠✨",
        "That's so fascinating! 🦋",
        "You're amazing! 🌹",
        "Every answer makes me fall more! 🥰",
        "You have the most beautiful soul! ✨",
        "You're perfection! 💫",
        "You just melted my heart! 🫠",
        "I could listen to you forever! 🎶"
    ])

    const CARD_STYLES: CardStyle[] = ['rose', 'gold', 'lavender', 'sky', 'peach']

    const handleAnswer = async () => {
        if (!answer.trim()) return

        // 1. Show Compliment with Random Style
        const randomIndex = Math.floor(Math.random() * remainingCompliments.length)
        const randomCompliment = remainingCompliments[randomIndex]
        const newRemaining = remainingCompliments.filter((_, i) => i !== randomIndex)
        setRemainingCompliments(newRemaining)
        const randomStyle = CARD_STYLES[Math.floor(Math.random() * CARD_STYLES.length)]

        setCompliment(randomCompliment)
        setCardStyle(randomStyle)

        // 2. Wait 2 seconds then process
        setTimeout(async () => {
            const currentQuestion = QUESTIONS[qIndex]
            const newEntry = { question: currentQuestion.text, answer: answer }
            const newAnswers = [...allAnswers, newEntry]

            setAllAnswers(newAnswers)
            setAnswer('')
            setCompliment('') // Clear compliment

            await updateSession({ answers: newAnswers })

            if (qIndex < QUESTIONS.length - 1) {
                setQIndex(prev => prev + 1)
            } else {
                setState('MESSAGE')
            }
        }, 2000)
    }

    const handleYes = () => {
        updateSession({ final_response: 'YES' })
        setState('SUCCESS')
        fireConfetti()
    }

    const handleNo = () => {
        setNoCount(prev => prev + 1)
        updateSession({ no_attempts: noCount + 1 })
    }

    /* FLAMES Logic */
    const calculateFlames = (name1: string, name2: string): string => {
        // Convert to lowercase and remove spaces
        let n1 = name1.toLowerCase().replace(/\s/g, '').split('')
        let n2 = name2.toLowerCase().replace(/\s/g, '').split('')

        // Remove common characters
        for (let i = 0; i < n1.length; i++) {
            const char = n1[i]
            const indexInN2 = n2.indexOf(char)
            if (indexInN2 !== -1) {
                n1[i] = ''
                n2[indexInN2] = ''
            }
        }

        n1 = n1.filter(c => c !== '')
        n2 = n2.filter(c => c !== '')

        const count = n1.length + n2.length
        if (count === 0) return 'Soulmates'
        const flames = ['Friends', 'Love', 'Affection', 'Marriage', 'Enemy', 'Soulmates']
        let index = 0

        while (flames.length > 1) {
            index = (index + count - 1) % flames.length
            flames.splice(index, 1)
            if (index === flames.length) index = 0
        }

        return flames[0]
    }

    /* Love Calculator Logic */
    const calculateLove = (name1: string, name2: string): number => {
        // Create a deterministic but seemingly random percentage based on names
        const combined = (name1 + name2).toLowerCase().replace(/\s/g, '')
        let hash = 0

        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }

        // Ensure we get a percentage between 50-99 for romantic results
        const percentage = 50 + (Math.abs(hash) % 50)
        return percentage
    }

    const getLoveMessage = (percentage: number): string => {
        if (percentage >= 95) return "Perfect Match! You two are meant to be together! 💕✨"
        if (percentage >= 90) return "Soulmates! Your love is written in the stars! 🌟💖"
        if (percentage >= 85) return "Amazing Connection! True love is in the air! 💘🦋"
        if (percentage >= 80) return "Strong Bond! Your hearts beat as one! 💓💫"
        if (percentage >= 75) return "Beautiful Chemistry! Love is blooming! 🌹💝"
        if (percentage >= 70) return "Great Match! Your love story is just beginning! 📖💕"
        if (percentage >= 65) return "Sweet Connection! Romance is in the air! 🌸💗"
        if (percentage >= 60) return "Lovely Pair! Your bond is growing stronger! 🌺💖"
        if (percentage >= 55) return "Good Compatibility! Love is on the horizon! 🌅💕"
        return "Promising Start! Every love story has a beginning! 🌱💝"
    }

    const handleFlamesCalculate = () => {
        if (!flamesName1.trim() || !flamesName2.trim()) return
        const result = calculateFlames(flamesName1, flamesName2)
        const percentage = calculateLove(flamesName1, flamesName2)
        const message = getLoveMessage(percentage)

        setFlamesResult(result)
        setLovePercentage(percentage)
        setLoveMessage(message)
        setShowTryAgain(true)
        setCountdown(6)
    }

    // Countdown timer effect for FLAMES result
    useEffect(() => {
        if (showTryAgain && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else if (showTryAgain && countdown === 0) {
            setState('PROPOSAL')
        }
    }, [showTryAgain, countdown])

    // Countdown timer effect for Love Calculator result
    useEffect(() => {
        if (showLoveTryAgain && loveCountdown > 0) {
            const timer = setTimeout(() => {
                setLoveCountdown(prev => prev - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else if (showLoveTryAgain && loveCountdown === 0) {
            setState('PROPOSAL')
        }
    }, [showLoveTryAgain, loveCountdown])

    const handleTryAgain = () => {
        setFlamesResult('')
        setShowTryAgain(false)
        setCountdown(6)
    }

    const handleLoveCalculate = () => {
        if (!loveName1.trim() || !loveName2.trim()) return
        const percentage = calculateLove(loveName1, loveName2)
        const message = getLoveMessage(percentage)
        setLovePercentage(percentage)
        setLoveMessage(message)
        setShowLoveTryAgain(true)
        setLoveCountdown(6)
    }

    const handleLoveTryAgain = () => {
        setLovePercentage(0)
        setLoveMessage('')
        setShowLoveTryAgain(false)
        setLoveCountdown(6)
    }

    /* Smart No Button Logic */
    const moveNoButton = () => {
        const x = Math.random() * (window.innerWidth - 200) - (window.innerWidth / 2 - 100);
        const y = Math.random() * (window.innerHeight - 200) - (window.innerHeight / 2 - 100);
        setNoBtnPosition({ x, y });
    }

    const fireConfetti = () => {
        const duration = 5000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    if (!mounted) return null

    // Animation variants
    const fadeIn = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
        transition: { duration: 0.4 }
    }

    const currentQ = QUESTIONS[qIndex];

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-6 font-romantic select-none overflow-x-hidden overflow-y-auto">
            <HeartBackground />

            {/* Decorative Flowers */}
            <div className="fixed top-0 left-0 w-32 h-32 md:w-64 md:h-64 pointer-events-none z-0 opacity-80">
                <Image src="/flowers_v2.png" alt="flowers" fill className="object-contain -translate-x-10 -translate-y-10 rotate-12" />
            </div>
            <div className="fixed bottom-0 right-0 w-32 h-32 md:w-64 md:h-64 pointer-events-none z-0 opacity-80">
                <Image src="/flowers_v2.png" alt="flowers" fill className="object-contain translate-x-10 translate-y-10 rotate-180" />
            </div>

            {/* ROOT LEVEL ESCAPING BUTTON - Avoids clipping/transform issues */}
            {state === 'PROPOSAL' && noCount > 0 && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, x: noBtnPosition.x, y: noBtnPosition.y }}
                    onMouseEnter={moveNoButton}
                    onClick={moveNoButton}
                    style={{ position: 'fixed', left: '50%', top: '50%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="z-[100] bg-gray-400 hover:bg-gray-500 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg whitespace-nowrap transition-colors"
                    ref={noBtnRef}
                >
                    Please don't... 😢
                </motion.button>
            )}

            <AnimatePresence mode="wait">

                {/* INTRO SCREEN */}
                {state === 'INTRO' && (
                    <motion.div
                        key="intro"
                        {...fadeIn}
                        className="z-10 bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-md w-full text-center flex flex-col items-center"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-pink-100 p-4 rounded-full shadow-inner animate-pulse">
                                <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold italic text-rose-900 mb-2 drop-shadow-sm">Hello beautiful...</h1>
                        <p className="text-rose-800 mb-2 font-medium italic">Before we begin, may I know your name?</p>
                        <p className="text-rose-600 text-xs italic mb-6 bg-rose-50/50 p-2 rounded-lg border border-rose-200">
                            💡 We'll use this name throughout the experience (including FLAMES!)
                        </p>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name..."
                            className="w-full bg-white/70 border-2 border-rose-200 rounded-xl px-4 py-3 text-lg text-rose-900 placeholder:text-rose-300 focus:ring-4 focus:ring-rose-200 focus:border-rose-400 focus:outline-none transition-all mb-6 text-center shadow-inner"
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        />

                        <button
                            onClick={handleStart}
                            disabled={!name.trim()}
                            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            Begin <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}

                {/* QUESTIONS SCREEN */}
                {state === 'QUESTIONS' && currentQ && (
                    <motion.div
                        key={`q-${qIndex}`}
                        {...fadeIn}
                        className="z-10 bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-lg w-full"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-rose-500 bg-rose-100 px-3 py-1 rounded-full">
                                Question {qIndex + 1} / {QUESTIONS.length}
                            </div>
                            <Heart className="text-rose-300 fill-rose-100" size={20} />
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold italic text-rose-900 mb-8 leading-relaxed">
                            {currentQ.text}
                        </h2>

                        {currentQ.type === 'text' ? (
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                rows={4}
                                className="w-full bg-white/60 border-2 border-rose-200 rounded-xl px-4 py-3 text-lg text-rose-900 placeholder:text-rose-300 focus:ring-4 focus:ring-rose-200 focus:border-rose-400 focus:outline-none transition-all mb-6 resize-none shadow-inner"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAnswer();
                                    }
                                }}
                                autoFocus
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-3 mb-6">
                                {currentQ.options?.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setAnswer(opt)}
                                        className={cn(
                                            "w-full text-left px-6 py-4 rounded-xl border-2 transition-all font-medium text-lg relative overflow-hidden group",
                                            answer === opt
                                                ? "bg-gradient-to-r from-rose-100 to-pink-50 border-rose-500 text-rose-900 shadow-md transform scale-[1.02]"
                                                : "bg-white/60 border-white hover:bg-white/90 hover:border-rose-200 text-rose-800"
                                        )}
                                    >
                                        <span className="relative z-10">{opt}</span>
                                        {answer === opt && (
                                            <motion.div
                                                layoutId="highlight"
                                                className="absolute inset-0 bg-rose-100/50 z-0"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleAnswer}
                            disabled={!answer.trim()}
                            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:brightness-110 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next <Send size={18} />
                        </button>

                        <AnimatePresence>
                            {compliment && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                                    className={cn(
                                        "absolute inset-0 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center p-6 z-50 text-center border-[6px] border-double shadow-[inset_0_0_40px_rgba(255,255,255,0.2)] overflow-hidden transition-colors duration-500",
                                        cardStyle === 'rose' && "bg-gradient-to-br from-pink-50/95 via-rose-100/95 to-red-50/95 border-rose-300",
                                        cardStyle === 'gold' && "bg-gradient-to-br from-amber-50/95 via-yellow-100/95 to-orange-50/95 border-amber-300",
                                        cardStyle === 'lavender' && "bg-gradient-to-br from-purple-50/95 via-violet-100/95 to-pink-50/95 border-purple-300",
                                        cardStyle === 'sky' && "bg-gradient-to-br from-sky-50/95 via-blue-100/95 to-pink-50/95 border-sky-300",
                                        cardStyle === 'peach' && "bg-gradient-to-br from-orange-50/95 via-pink-100/95 to-rose-50/95 border-orange-300"
                                    )}
                                >
                                    {/* Decorative Background Elements */}
                                    <div className="absolute top-2 left-2 opacity-50 text-rose-300">✦</div>
                                    <div className="absolute top-2 right-2 opacity-50 text-rose-300">✦</div>
                                    <div className="absolute bottom-2 left-2 opacity-50 text-rose-300">✦</div>
                                    <div className="absolute bottom-2 right-2 opacity-50 text-rose-300">✦</div>

                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 10, -10, 0],
                                            filter: ["drop-shadow(0 0 0px rgba(255,105,180,0))", "drop-shadow(0 0 20px rgba(255,105,180,0.5))", "drop-shadow(0 0 0px rgba(255,105,180,0))"]
                                        }}
                                        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                                        className="relative"
                                    >
                                        <Heart className={cn(
                                            "w-24 h-24 mb-6 drop-shadow-xl",
                                            cardStyle === 'rose' && "text-rose-500 fill-rose-500",
                                            cardStyle === 'gold' && "text-amber-500 fill-amber-500",
                                            cardStyle === 'lavender' && "text-purple-400 fill-purple-400",
                                            cardStyle === 'sky' && "text-sky-500 fill-sky-500",
                                            cardStyle === 'peach' && "text-orange-400 fill-orange-400"
                                        )} />
                                        <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-8 h-8 animate-pulse" />
                                    </motion.div>

                                    <h2 className={cn(
                                        "text-4xl font-black italic text-transparent bg-clip-text drop-shadow-sm leading-tight px-4",
                                        cardStyle === 'rose' && "bg-gradient-to-br from-rose-600 via-pink-600 to-rose-500",
                                        cardStyle === 'gold' && "bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-600",
                                        cardStyle === 'lavender' && "bg-gradient-to-br from-purple-600 via-violet-500 to-pink-600",
                                        cardStyle === 'sky' && "bg-gradient-to-br from-sky-600 via-blue-500 to-indigo-500",
                                        cardStyle === 'peach' && "bg-gradient-to-br from-orange-600 via-pink-500 to-rose-600"
                                    )}>
                                        {compliment}
                                    </h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* MESSAGE SCREEN */}
                {state === 'MESSAGE' && (
                    <motion.div
                        key="message"
                        {...fadeIn}
                        className="z-10 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-xl w-full text-center relative overflow-hidden"
                    >
                        <Sparkles className="absolute top-4 right-4 text-yellow-500 animate-spin-slow w-8 h-8" />
                        <Sparkles className="absolute bottom-4 left-4 text-pink-400 animate-pulse w-6 h-6" />

                        <h2 className="text-3xl font-bold italic text-rose-800 mb-6 drop-shadow-sm">A Message for {name}...</h2>

                        <div className="prose prose-rose max-w-none mb-8 text-rose-900 italic text-xl leading-relaxed">
                            <p>Dearest {name},</p>
                            <p>
                                From the moment I met you, the world has seemed a little brighter.
                                Your smile is my favorite sunrise, and your laughter is a melody
                                I could listen to forever. 🌹
                            </p>
                            <p>
                                Every answer you gave just now made me adore you even more.
                                I cherish every moment we share, and I dream of creating
                                countless more loving memories with you. 🥰
                            </p>
                            <p className="font-semibold text-2xl mt-4">
                                You are truly magical. ✨
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setFlamesName1(name)
                                setState('FLAMES')
                            }}
                            className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white font-extrabold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 text-lg"
                        >
                            Let's Play! 🔥💕
                        </button>
                    </motion.div>
                )}

                {/* FLAMES SCREEN */}
                {state === 'FLAMES' && (
                    <motion.div
                        key="flames"
                        {...fadeIn}
                        className="z-10 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-[95vw] md:max-w-lg text-center relative overflow-hidden my-4"
                    >
                        <div className="mb-6">
                            <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 mb-2 drop-shadow-sm">
                                Love Games 🔥💕
                            </h2>
                            <p className="text-rose-700 italic text-lg">Let's see what destiny says about you two!</p>
                        </div>

                        {!flamesResult ? (
                            <>
                                <p className="text-rose-600 text-sm italic mb-4 bg-rose-50/50 p-3 rounded-lg border border-rose-200">
                                    💡 Tip: We've added your name, but you can edit both names if you'd like!
                                </p>
                                <div className="space-y-4 mb-6">
                                    <input
                                        type="text"
                                        value={flamesName1}
                                        onChange={(e) => setFlamesName1(e.target.value)}
                                        placeholder="Your name..."
                                        className="w-full bg-white/70 border-2 border-rose-200 rounded-xl px-4 py-3 text-lg text-rose-900 placeholder:text-rose-300 focus:ring-4 focus:ring-rose-200 focus:border-rose-400 focus:outline-none transition-all text-center shadow-inner"
                                    />
                                    <input
                                        type="text"
                                        value={flamesName2}
                                        onChange={(e) => setFlamesName2(e.target.value)}
                                        placeholder="Their name..."
                                        className="w-full bg-white/70 border-2 border-rose-200 rounded-xl px-4 py-3 text-lg text-rose-900 placeholder:text-rose-300 focus:ring-4 focus:ring-rose-200 focus:border-rose-400 focus:outline-none transition-all text-center shadow-inner"
                                        onKeyDown={(e) => e.key === 'Enter' && handleFlamesCalculate()}
                                    />
                                </div>

                                <button
                                    onClick={handleFlamesCalculate}
                                    disabled={!flamesName1.trim() || !flamesName2.trim()}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Calculate FLAMES 🔥
                                </button>
                            </>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="py-2 md:py-4"
                            >
                                {/* Combined Results Display */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                                    {/* FLAMES Result Card */}
                                    <motion.div
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-6 rounded-2xl border-2 border-orange-200 shadow-lg"
                                    >
                                        <div className="mb-3 md:mb-4">
                                            <div className="text-xs md:text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">FLAMES Result</div>
                                            <Heart className="w-12 h-12 md:w-16 md:h-16 mx-auto text-rose-500 fill-rose-500 animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
                                            {flamesResult}!
                                        </h3>
                                        <p className="text-rose-600 text-xs md:text-sm italic">
                                            🔥 Destiny says...
                                        </p>
                                    </motion.div>

                                    {/* Love Percentage Card */}
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 md:p-6 rounded-2xl border-2 border-pink-200 shadow-lg"
                                    >
                                        <div className="mb-3 md:mb-4">
                                            <div className="text-xs md:text-sm font-bold text-pink-600 uppercase tracking-wider mb-2">Love Match</div>
                                            {/* Animated percentage circle - responsive size */}
                                            <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle
                                                        cx="56"
                                                        cy="56"
                                                        r="50"
                                                        stroke="#fce7f3"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        className="md:hidden"
                                                    />
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="58"
                                                        stroke="#fce7f3"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        className="hidden md:block"
                                                    />
                                                    <motion.circle
                                                        cx="56"
                                                        cy="56"
                                                        r="50"
                                                        stroke="url(#gradient-small)"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        initial={{ strokeDasharray: "0 314" }}
                                                        animate={{ strokeDasharray: `${(lovePercentage / 100) * 314} 314` }}
                                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                                        className="md:hidden"
                                                    />
                                                    <motion.circle
                                                        cx="64"
                                                        cy="64"
                                                        r="58"
                                                        stroke="url(#gradient-small)"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        initial={{ strokeDasharray: "0 364" }}
                                                        animate={{ strokeDasharray: `${(lovePercentage / 100) * 364} 364` }}
                                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                                        className="hidden md:block"
                                                    />
                                                    <defs>
                                                        <linearGradient id="gradient-small" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#ec4899" />
                                                            <stop offset="100%" stopColor="#f43f5e" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.8, type: "spring" }}
                                                        className="text-center"
                                                    >
                                                        <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-600">
                                                            {lovePercentage}%
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-pink-600 text-xs md:text-sm italic">
                                            💕 Compatibility Score
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Combined Message */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="mb-4 md:mb-6 bg-white/70 backdrop-blur-sm p-4 md:p-6 rounded-2xl border-2 border-rose-200 shadow-lg"
                                >
                                    <h4 className="text-lg md:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-2 md:mb-3 leading-tight">
                                        {loveMessage}
                                    </h4>
                                    <p className="text-rose-700 italic text-base md:text-lg font-medium">
                                        {flamesName1} 💕 {flamesName2}
                                    </p>
                                </motion.div>

                                {showTryAgain && (
                                    <>
                                        <div className="mb-4 md:mb-6 bg-rose-50/70 backdrop-blur-sm p-3 md:p-4 rounded-xl border-2 border-rose-200">
                                            <p className="text-rose-600 text-base md:text-lg font-bold mb-1 md:mb-2">
                                                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                                            </p>
                                            <p className="text-rose-500 text-xs md:text-sm italic">
                                                Want to try different names?
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleTryAgain}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 text-base md:text-lg"
                                        >
                                            🔄 Try Again
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* LOVE CALCULATOR SCREEN */}
                {state === 'LOVE_CALCULATOR' && (
                    <motion.div
                        key="love-calculator"
                        {...fadeIn}
                        className="z-10 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 max-w-lg w-full text-center relative overflow-hidden"
                    >
                        <div className="mb-6">
                            <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 mb-2 drop-shadow-sm">
                                Love Calculator 💕
                            </h2>
                            <p className="text-rose-700 italic text-lg">Discover your love compatibility!</p>
                        </div>

                        {lovePercentage === 0 ? (
                            <>
                                <p className="text-rose-600 text-sm italic mb-4 bg-rose-50/50 p-3 rounded-lg border border-rose-200">
                                    💡 Tip: We've added your name, but you can edit both names if you'd like!
                                </p>
                                <div className="space-y-4 mb-6">
                                    <input
                                        type="text"
                                        value={loveName1}
                                        onChange={(e) => setLoveName1(e.target.value)}
                                        placeholder="Your name..."
                                        className="w-full bg-white/70 border-2 border-rose-200 rounded-xl px-4 py-3 text-lg text-rose-900 placeholder:text-rose-300 focus:ring-4 focus:ring-rose-200 focus:border-rose-400 focus:outline-none transition-all text-center shadow-inner"
                                    />
                                    <div className="flex justify-center">
                                        <Heart className="w-8 h-8 text-rose-400 fill-rose-400 animate-pulse" />
                                    </div>
                                    <input
                                        type="text"
                                        value={loveName2}
                                        onChange={(e) => setLoveName2(e.target.value)}
                                        placeholder="Their name..."
                                        className="w-full bg-white/70 border-2 border-rose-200 rounded-xl px-4 py-3 text-lg text-rose-900 placeholder:text-rose-300 focus:ring-4 focus:ring-rose-200 focus:border-rose-400 focus:outline-none transition-all text-center shadow-inner"
                                        onKeyDown={(e) => e.key === 'Enter' && handleLoveCalculate()}
                                    />
                                </div>

                                <button
                                    onClick={handleLoveCalculate}
                                    disabled={!loveName1.trim() || !loveName2.trim()}
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Calculate Love 💕
                                </button>
                            </>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="py-8"
                            >
                                {/* Animated percentage circle */}
                                <div className="relative w-48 h-48 mx-auto mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="#fce7f3"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <motion.circle
                                            cx="96"
                                            cy="96"
                                            r="88"
                                            stroke="url(#gradient)"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "0 552" }}
                                            animate={{ strokeDasharray: `${(lovePercentage / 100) * 552} 552` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#ec4899" />
                                                <stop offset="100%" stopColor="#f43f5e" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5, type: "spring" }}
                                            className="text-center"
                                        >
                                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-rose-600">
                                                {lovePercentage}%
                                            </div>
                                            <Heart className="w-8 h-8 mx-auto text-rose-500 fill-rose-500 animate-pulse mt-2" />
                                        </motion.div>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-4">
                                    {loveMessage}
                                </h3>
                                <p className="text-rose-700 italic text-lg mb-6">
                                    {loveName1} 💕 {loveName2}
                                </p>

                                {showLoveTryAgain && (
                                    <>
                                        <div className="mb-6 bg-rose-50/70 backdrop-blur-sm p-4 rounded-xl border-2 border-rose-200">
                                            <p className="text-rose-600 text-lg font-bold mb-2">
                                                Redirecting in {loveCountdown} second{loveCountdown !== 1 ? 's' : ''}...
                                            </p>
                                            <p className="text-rose-500 text-sm italic">
                                                Want to try different names?
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleLoveTryAgain}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            🔄 Try Again
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* PROPOSAL SCREEN */}
                {state === 'PROPOSAL' && (
                    <motion.div
                        key="proposal"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="z-10 text-center flex flex-col items-center relative w-full"
                    >
                        <div className="mb-6 relative w-48 h-48 md:w-64 md:h-64 animate-float">
                            <Image
                                src={noCount > 0 ? "/crying-teddy_final.png" : "/intro-bear.png"}
                                alt="Cute Bear"
                                fill
                                className="object-contain drop-shadow-2xl transition-all duration-300"
                                priority
                            />
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-rose-600 via-red-500 to-pink-600 mb-8 drop-shadow-sm leading-tight p-2">
                            {noCount === 0 ? (
                                <>{name}, will you be my<br />Valentine? 💖</>
                            ) : (
                                "My heart beats only for you... 🥺"
                            )}
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-4 h-40 relative w-full">
                            <button
                                onClick={handleYes}
                                className="bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white text-3xl font-black py-6 px-16 rounded-full shadow-2xl hover:shadow-[0_0_40px_rgba(74,222,128,0.6)] hover:scale-110 active:scale-95 transition-all z-20 border-4 border-white/20 whitespace-nowrap"
                            >
                                YES! ❤️
                            </button>

                            {/* Static No Button - Only shows when count is 0 */}
                            {noCount === 0 && (
                                <button
                                    onClick={handleNo}
                                    className="bg-gray-400 hover:bg-gray-500 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg whitespace-nowrap transition-colors"
                                >
                                    NO 💔
                                </button>
                            )}
                        </div>

                        {noCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-rose-200 shadow-xl max-w-md"
                            >
                                <p className="text-xl font-bold italic text-rose-800 mb-2">
                                    {noCount <= 2 ? "Every moment with you is magic... ✨" :
                                        noCount <= 5 ? "You are my favorite person! 🌹" :
                                            "I can't imagine a world without you! 😭"}
                                </p>
                                <p className="text-rose-600 text-sm italic">
                                    (The 'No' button is just playing hard to get, like you! 😉)
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* SUCCESS SCREEN */}
                {state === 'SUCCESS' && (
                    <motion.div
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="z-10 text-center p-10 bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl max-w-3xl border-4 border-white/50 flex flex-col items-center"
                    >
                        <div className="mb-8 relative w-64 h-64">
                            <Image
                                src="/celebration.png"
                                alt="Celebration"
                                fill
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>

                        <h1 className="text-6xl font-black italic text-rose-600 mb-6 drop-shadow-sm tracking-tight">YAAAY!!! 🎉💖</h1>
                        <p className="text-3xl text-rose-900 mb-10 font-medium italic leading-relaxed">
                            You just made me the happiest person in the world, <span className="font-bold underline decoration-wavy decoration-rose-400">{name}</span>!
                            <br />Get ready for the best Valentine's Day ever! 🌹🎁
                        </p>
                        <div className="flex justify-center gap-6 mb-6">
                            <Heart className="w-20 h-20 text-pink-500 fill-pink-500 animate-bounce drop-shadow-lg" />
                            <Heart className="w-20 h-20 text-rose-500 fill-rose-500 animate-bounce delay-100 drop-shadow-lg" />
                            <Heart className="w-20 h-20 text-red-500 fill-red-500 animate-bounce delay-200 drop-shadow-lg" />
                        </div>
                        <p className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 drop-shadow-sm">
                            Love you 💖💕
                        </p>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    )
}
