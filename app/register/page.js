'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Eye, EyeOff, Mail, Lock, User, Building, ArrowLeft, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const campuses = [
    { value: 'cst', label: 'College of Science and Technology (CST)' },
    { value: 'rtc', label: 'Royal Thimphu College (RTC)' },
    { value: 'jnec', label: 'Jigme Namgyel Engineering College (JNEC)' },
    { value: 'gcbs', label: 'Gaeddu College of Business Studies (GCBS)' },
    { value: 'sce', label: 'Samtse College of Education (SCE)' },
    { value: 'cnr', label: 'College of Natural Resources (CNR)' },
    { value: 'household', label: 'Household / General User' },
];
const benefits = [
    'Complete daily eco-challenges',
    'Earn points and climb leaderboards',
    'Unlock badges and achievements',
    'Track your environmental impact',
];
export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        campus: '',
        password: '',
    });
    const updateField = (field, value) => {
        setFormData((current) => ({ ...current, [field]: value }));
        setError('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.error || 'Unable to create account.');
            }
            if (result.user) {
                localStorage.setItem('ecoquest_user', JSON.stringify(result.user));
            }
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen flex eco-pattern">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"/>
          <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"/>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white"/>
            </div>
            <span className="font-semibold text-lg text-white">EcoQuest</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Join the Zero Waste Movement
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-md">
              Be part of Bhutan&apos;s mission towards a sustainable future. Start your eco-journey today.
            </p>
            <ul className="space-y-3">
              {benefits.map((benefit) => (<li key={benefit} className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-white/70 flex-shrink-0"/>
                  <span>{benefit}</span>
                </li>))}
            </ul>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold text-white">15</div>
              <div className="text-white/70 text-sm">Campuses</div>
            </div>
            <div className="w-px h-12 bg-white/20"/>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-white/70 text-sm">Smart Bins</div>
            </div>
            <div className="w-px h-12 bg-white/20"/>
            <div>
              <div className="text-3xl font-bold text-white">Free</div>
              <div className="text-white/70 text-sm">Forever</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <ArrowLeft className="w-4 h-4"/>
            <span className="text-sm">Back to home</span>
          </Link>

          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="lg:hidden flex justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary-foreground"/>
                </div>
              </div>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                {step === 1 ? 'Enter your personal details' : 'Select your campus and create password'}
              </CardDescription>
              <div className="flex justify-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}/>
                <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}/>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (<>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <Input id="name" type="text" placeholder="Username" className="pl-10" value={formData.name} onChange={(e) => updateField('name', e.target.value)} required/>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <Input id="email" type="email" placeholder="name@example.com" className="pl-10" value={formData.email} onChange={(e) => updateField('email', e.target.value)} required/>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <Input id="phone" type="tel" placeholder="+975 17 000 000" className="pl-10" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)}/>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                  </>) : (<>
                    <div className="space-y-2">
                      <Label htmlFor="campus">Campus / Location</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10"/>
                        <Select required value={formData.campus} onValueChange={(value) => updateField('campus', value)}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select your campus"/>
                          </SelectTrigger>
                          <SelectContent>
                            {campuses.map((campus) => (<SelectItem key={campus.value} value={campus.value}>
                                {campus.label}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="pl-10 pr-10" value={formData.password} onChange={(e) => updateField('password', e.target.value)} required minLength={8}/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Account'}
                      </Button>
                    </div>
                    {error ? <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
                  </>)}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"/>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full">
                  Continue with Phone Number
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>

              <p className="text-center text-xs text-muted-foreground mt-4">
                By creating an account, you agree to our{' '}
                <Link href="#" className="underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="underline">Privacy Policy</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>);
}
