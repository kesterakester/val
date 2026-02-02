'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

export default function HeartBackground() {
    const [elements, setElements] = useState<{ id: number; left: number; duration: number; delay: number; scale: number }[]>([])

    useEffect(() => {
        setElements(Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            scale: Math.random() * 0.5 + 0.5
        })))
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    initial={{ y: "110vh", opacity: 0 }}
                    animate={{ y: "-10vh", opacity: [0, 1, 0] }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        delay: el.delay,
                        ease: "linear"
                    }}
                    className="absolute text-pink-300"
                    style={{
                        left: `${el.left}%`,
                    }}
                >
                    <Heart fill="currentColor" size={el.scale * 40} className="opacity-60" />
                </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none" />
        </div>
    )
}
