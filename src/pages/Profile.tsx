import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Loader2, MapPin, Plus, X, Star, ExternalLink, Trash2, Briefcase, Camera } from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  
  // Skills State
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [isAddingSkill, setIsAddingSkill] = useState<'offering' | 'seeking' | null>(null);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  
  // Portfolio State
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', project_url: '' });
  const [submittingProject, setSubmittingProject] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.getProfile(user.id),
        api.getAllSkills(),
        api.getUserSkills(user.id),
        api.getUserReviews(user.id),
        api.getPortfolio(user.id)
      ])
        .then(([profileData, skillsData, userSkillsData, reviewsData, portfolioData]) => {
          setFullName((profileData as any)?.full_name || '');
          setBio((profileData as any)?.bio || '');
          setLocation((profileData as any)?.location || '');
          setAvatarUrl((profileData as any)?.avatar_url || '');
          setIsPublic((profileData as any)?.is_public ?? true);
          setShowLocation((profileData as any)?.show_location ?? true);
          setAllSkills(skillsData || []);
          setUserSkills(userSkillsData || []);
          setReviews(reviewsData || []);
          setPortfolio(portfolioData || []);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateProfile(user.id, {
        full_name: fullName,
        bio,
        location,
        avatar_url: avatarUrl,
        is_public: isPublic,
        show_location: showLocation
      });
      alert('Profile saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    try {
      const url = await api.uploadAvatar(user.id, file);
      setAvatarUrl(url);
      
      // Auto-save the new avatar to the profile
      await api.updateProfile(user.id, {
        full_name: fullName,
        bio,
        location,
        avatar_url: url,
        is_public: isPublic,
        show_location: showLocation
      });
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddPortfolio = async () => {
    if (!user || !newProject.title) return;
    setSubmittingProject(true);
    try {
      const item = await api.addPortfolioItem({ ...newProject, user_id: user.id });
      setPortfolio(prev => [item, ...prev]);
      setPortfolioModalOpen(false);
      setNewProject({ title: '', description: '', project_url: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to add project");
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.deletePortfolioItem(id);
      setPortfolio(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (skillId: string, type: 'offering' | 'seeking') => {
    if (!user) return;
    try {
      await api.addUserSkill(user.id, skillId, type);
      // Fetch fresh to get joined skill data easily
      const freshSkills = await api.getUserSkills(user.id);
      setUserSkills(freshSkills);
      setIsAddingSkill(null);
    } catch (err) {
      console.error(err);
      alert("Could not add skill. You may already have it listed.");
    }
  };

  const handleRemoveSkill = async (userSkillId: string) => {
    try {
      await api.removeUserSkill(userSkillId);
      setUserSkills(prev => prev.filter(s => s.id !== userSkillId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove skill");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const offeringSkills = userSkills.filter(s => s.type === 'offering');
  const seekingSkills = userSkills.filter(s => s.type === 'seeking');

  // Filter out skills the user already has for the add dropdown
  const availableSkillsToAdd = allSkills.filter(s => !userSkills.some(us => us.skills?.id === s.id));

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-8 transition-colors duration-300">
      <div className="sticky top-0 bg-card/90 backdrop-blur-md z-40 px-6 pt-12 pb-4 flex justify-between items-center border-b border-border">
        <button onClick={() => navigate('/dashboard')} className="text-gray-800"><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="font-bold text-lg flex-1 text-center ml-12">Edit Profile</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button onClick={handleSave} disabled={saving} className="text-primary font-bold text-sm flex items-center gap-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-12">
        
        {/* Basic Info Section */}
        <div>
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  fullName?.charAt(0) || user?.email?.charAt(0)
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload} 
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
          </div>
          
            <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-foreground/60 block mb-2">Display Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 bg-muted border border-border rounded-xl outline-none focus:border-primary text-foreground" 
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground/60 block mb-2">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-4 bg-muted border border-border rounded-xl outline-none focus:border-primary h-32 resize-none text-foreground" 
                placeholder="Tell others what you are passionate about..."
              ></textarea>
            </div>
            <div>
              <label className="text-sm font-bold text-foreground/60 block mb-2">Location</label>
              <div className="flex items-center p-4 bg-muted border border-border rounded-xl focus-within:border-primary transition-colors">
                <MapPin className="w-5 h-5 text-foreground/40 mr-2" />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country" 
                  className="bg-transparent outline-none flex-1 text-foreground" 
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Privacy Settings Section */}
        <div>
          <h2 className="text-xl font-bold mb-6">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl">
              <div>
                <h3 className="font-bold text-foreground">Public Profile</h3>
                <p className="text-sm text-foreground/60">Allow others to find you in Explore and Recommendations.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl">
              <div>
                <h3 className="font-bold text-foreground">Show Location</h3>
                <p className="text-sm text-foreground/60">Display your city/country to other users.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={showLocation} onChange={(e) => setShowLocation(e.target.checked)} />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Skills Management Section */}
        <div>
          <h2 className="text-xl font-bold mb-6">Manage Skills</h2>
          
          {/* Offering Skills */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground/70">What I can teach</h3>
              <button 
                onClick={() => setIsAddingSkill(isAddingSkill === 'offering' ? null : 'offering')}
                className="text-sm text-primary font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {offeringSkills.map(us => (
                <div key={us.id} className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 text-secondary-foreground rounded-full text-sm font-medium">
                  {us.skills?.name}
                  <button onClick={() => handleRemoveSkill(us.id)} className="hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {offeringSkills.length === 0 && <p className="text-sm text-foreground/40">You haven't listed any skills you can teach yet.</p>}
            </div>

            {isAddingSkill === 'offering' && (
              <div className="mt-4 p-4 bg-muted rounded-xl border border-border">
                <p className="text-xs font-bold text-foreground/40 mb-3 uppercase tracking-wider">Select a skill to add:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSkillsToAdd.map(skill => (
                    <button 
                      key={skill.id}
                      onClick={() => handleAddSkill(skill.id, 'offering')}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-colors text-foreground"
                    >
                      {skill.name}
                    </button>
                  ))}
                  {availableSkillsToAdd.length === 0 && <p className="text-sm text-foreground/40">No more skills available to add.</p>}
                </div>
              </div>
            )}
          </div>

          {/* Seeking Skills */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-foreground/70">What I want to learn</h3>
              <button 
                onClick={() => setIsAddingSkill(isAddingSkill === 'seeking' ? null : 'seeking')}
                className="text-sm text-primary font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {seekingSkills.map(us => (
                <div key={us.id} className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium">
                  {us.skills?.name}
                  <button onClick={() => handleRemoveSkill(us.id)} className="hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {seekingSkills.length === 0 && <p className="text-sm text-foreground/40">You haven't listed any skills you want to learn yet.</p>}
            </div>

            {isAddingSkill === 'seeking' && (
              <div className="mt-4 p-4 bg-muted rounded-xl border border-border">
                <p className="text-xs font-bold text-foreground/40 mb-3 uppercase tracking-wider">Select a skill to add:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSkillsToAdd.map(skill => (
                    <button 
                      key={skill.id}
                      onClick={() => handleAddSkill(skill.id, 'seeking')}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-colors text-foreground"
                    >
                      {skill.name}
                    </button>
                  ))}
                  {availableSkillsToAdd.length === 0 && <p className="text-sm text-foreground/40">No more skills available to add.</p>}
                </div>
              </div>
            )}
          </div>

        </div>

        <hr className="border-border" />

        {/* Portfolio Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              My Portfolio
            </h2>
            <button 
              onClick={() => setPortfolioModalOpen(true)}
              className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>
          
          <div className="grid gap-4">
            {portfolio.length === 0 ? (
              <div className="bg-muted border-2 border-dashed border-border rounded-3xl p-8 text-center">
                <p className="text-foreground/40 text-sm">Showcase your best work here to build trust!</p>
              </div>
            ) : (
              portfolio.map((item) => (
                <div key={item.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.project_url && (
                        <a href={item.project_url} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-full text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => handleDeletePortfolio(item.id)} className="p-2 hover:bg-muted rounded-full text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-foreground/60 text-sm">{item.description}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold">Reviews</h2>
            {avgRating && (
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                <Star className="w-4 h-4 fill-current" />
                {avgRating} Average
              </div>
            )}
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-foreground/40 italic">No reviews yet. Complete some skill-sharing sessions to build your reputation!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-muted p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                        {review.reviewer?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{review.reviewer?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-foreground/40">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-foreground/20'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-foreground/80 text-sm mt-2">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      {portfolioModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-border">
            <button onClick={() => setPortfolioModalOpen(false)} className="absolute top-6 right-6 text-foreground/50 hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2">Add Project</h2>
            <p className="text-foreground/60 mb-6">Showcase your skills with a recent project.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-foreground/40 block mb-2 uppercase tracking-wider">Project Title</label>
                <input 
                  type="text" 
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
                  placeholder="e.g., E-commerce Website"
                  className="w-full p-4 bg-muted border border-border rounded-xl outline-none focus:border-primary text-foreground" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/40 block mb-2 uppercase tracking-wider">Description</label>
                <textarea 
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  placeholder="What did you build and which skills did you use?"
                  className="w-full p-4 bg-muted border border-border rounded-xl outline-none focus:border-primary min-h-[100px] text-foreground" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/40 block mb-2 uppercase tracking-wider">Project Link (Optional)</label>
                <input 
                  type="url" 
                  value={newProject.project_url}
                  onChange={e => setNewProject({...newProject, project_url: e.target.value})}
                  placeholder="https://github.com/..."
                  className="w-full p-4 bg-muted border border-border rounded-xl outline-none focus:border-primary text-foreground" 
                />
              </div>
            </div>

            <button 
              onClick={handleAddPortfolio}
              disabled={submittingProject || !newProject.title}
              className="w-full py-4 bg-primary text-background rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submittingProject ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Add to Portfolio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
