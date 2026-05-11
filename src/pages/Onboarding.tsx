import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [selectedSeeks, setSelectedSeeks] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getAllSkills().then(skills => {
      setAllSkills(skills || []);
      setLoading(false);
    });
  }, []);

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save offerings
      for (const skillId of selectedOffers) {
        await api.addUserSkill(user.id, skillId, 'offering');
      }
      // Save seekings
      for (const skillId of selectedSeeks) {
        await api.addUserSkill(user.id, skillId, 'seeking');
      }
      // Use the actual name provided
      await api.updateProfile(user.id, { full_name: fullName || 'New User' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save skills');
      setSaving(false);
    }
  };

  const toggleSkill = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(s => s !== id));
    } else {
      if (list.length >= 3) return alert('You can only select up to 3 skills for now.');
      setList([...list, id]);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background px-6 pt-16 flex flex-col max-w-lg mx-auto pb-32">
      <div className="flex gap-2 mb-8">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
        <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
      </div>
      
      {step === 1 ? (
        <>
          <h1 className="text-3xl font-bold mb-4 text-foreground">Welcome to SkillSync!</h1>
          <p className="text-foreground/60 mb-8">Let's start with your name. How should the community call you?</p>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-4 py-4 rounded-xl border-2 border-border bg-muted focus:border-primary focus:outline-none text-lg transition-all text-foreground"
                autoFocus
              />
            </div>
          <div className="fixed bottom-0 left-0 right-0 w-full px-6 pb-6 pt-4 bg-background z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-border">
            <div className="max-w-lg mx-auto">
              <button 
                onClick={() => setStep(2)}
                disabled={!fullName.trim()}
                className="w-full py-4 bg-foreground text-background rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </>
      ) : step === 2 ? (
        <>
          <h1 className="text-3xl font-bold mb-2 text-foreground">What can you teach?</h1>
          <p className="text-foreground/60 mb-8">Select up to 3 skills you are proficient in and can offer to others.</p>
          <div className="flex flex-wrap gap-3">
            {allSkills.map((skill) => {
              const isSelected = selectedOffers.includes(skill.id);
              return (
                <button 
                  key={skill.id} 
                  onClick={() => toggleSkill(skill.id, selectedOffers, setSelectedOffers)}
                  className={`px-5 py-3 rounded-full font-medium border-2 transition-colors ${isSelected ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border text-foreground/60 hover:border-foreground/20'}`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
          <div className="fixed bottom-0 left-0 right-0 w-full px-6 pb-6 pt-4 bg-background z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-border">
            <div className="max-w-lg mx-auto flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-4 border-2 border-border text-foreground/60 rounded-xl font-bold text-lg"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={selectedOffers.length === 0}
                className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold text-lg disabled:opacity-50 shadow-lg transition-all"
              >
                Next Step
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2 text-foreground">What do you want to learn?</h1>
          <p className="text-foreground/60 mb-8">Select up to 3 skills you are looking to acquire from the community.</p>
          <div className="flex flex-wrap gap-3">
            {allSkills.map((skill) => {
              const isSelected = selectedSeeks.includes(skill.id);
              return (
                <button 
                  key={skill.id} 
                  onClick={() => toggleSkill(skill.id, selectedSeeks, setSelectedSeeks)}
                  className={`px-5 py-3 rounded-full font-medium border-2 transition-colors ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60 hover:border-foreground/20'}`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-muted rounded-2xl border border-border">
            <h3 className="font-bold text-lg mb-2 text-foreground">Setup Summary</h3>
            <div className="space-y-2 text-sm text-foreground/60">
              <p><span className="font-semibold text-foreground">Name:</span> {fullName}</p>
              <p><span className="font-semibold text-foreground">Offering:</span> {selectedOffers.map(id => allSkills.find(s => s.id === id)?.name).join(', ')}</p>
              <p><span className="font-semibold text-foreground">Learning:</span> {selectedSeeks.map(id => allSkills.find(s => s.id === id)?.name).join(', ')}</p>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 w-full px-6 pb-6 pt-4 bg-background z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-border">
            <div className="max-w-lg mx-auto flex gap-4">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-4 border-2 border-border text-foreground/60 rounded-xl font-bold text-lg"
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={selectedSeeks.length === 0 || saving}
                className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finish Setup'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
