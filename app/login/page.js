'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const email = e.target.email.value;
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const result = await res.json().catch(() => ({}));
            if (res.ok && result.user) {
                localStorage.setItem('ecoquest_user', JSON.stringify(result.user));
            }
        } catch {}
        setIsLoading(false);
        window.location.href = '/dashboard';
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
            <img src="/IMG_2014.png" alt="EcoQuest Bhutan" className="h-10 w-10 object-contain" />
            <span className="font-semibold text-lg text-white">EcoQuest</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome Back, Eco-Warrior
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Continue your journey towards a zero-waste future. Your challenges await.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold text-white">100+</div>
              <div className="text-white/70 text-sm">Active Users</div>
            </div>
            <div className="w-px h-12 bg-white/20"/>
            <div>
              <div className="text-3xl font-bold text-white">200</div>
              <div className="text-white/70 text-sm">Challenges Done</div>
            </div>
            <div className="w-px h-12 bg-white/20"/>
            <div>
              <div className="text-3xl font-bold text-white">1000</div> 
              <div className="text-white/70 text-sm">Waste Diverted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <ArrowLeft className="w-4 h-4"/>
            <span className="text-sm">Back to home</span>
          </Link>

          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="lg:hidden flex justify-center mb-4">
                <img src="/IMG_2014.png" alt="EcoQuest Bhutan" className="h-12 w-12 object-cover mix-blend-multiply" />
              </div>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input id="email" type="email" placeholder="you@example.com" className="pl-10" required/>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="pl-10 pr-10" required/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

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
                <Link href="/admin">
                  <Button type="button" variant="secondary" className="w-full">
                    Admin Sign In
                  </Button>
                </Link>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>);
}
