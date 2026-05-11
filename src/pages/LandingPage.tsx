import { useState, useEffect } from 'react'
import { Navbar } from '../components/skillsync/Navbar'
import { Hero } from '../components/skillsync/Hero'
import { SkillMarquee } from '../components/skillsync/SkillMarquee'
import { HowItWorks } from '../components/skillsync/HowItWorks'
import { Categories } from '../components/skillsync/Categories'
import { Stories } from '../components/skillsync/Stories'
import { CTA } from '../components/skillsync/CTA'
import { Footer } from '../components/skillsync/Footer'
import { AuthModal } from '../components/skillsync/AuthModal'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'

export const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const openAuth = (view: 'signin' | 'signup' = 'signin') => {
    setAuthModalView(view)
    setIsAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col font-body bg-background text-foreground overflow-x-hidden">
      <SEO />
      <Navbar 
        onOpenAuth={() => openAuth('signin')}
      />
      <main className="flex-1">
        <Hero onOpenAuth={() => openAuth('signin')} />
        <SkillMarquee />
        <HowItWorks />
        <Categories onOpenAuth={() => openAuth('signup')} />
        <Stories />
        <CTA onOpenAuth={() => openAuth('signup')} />
      </main>
      <Footer onOpenAuth={() => openAuth('signin')} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView}
      />
    </div>
  )
}
