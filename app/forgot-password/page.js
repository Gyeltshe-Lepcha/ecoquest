'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, MessageSquareText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <main className="min-h-screen eco-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Use email or OTP recovery to get back into EcoQuest.</CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <Tabs defaultValue="email" className="space-y-5">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-2">
                    <MessageSquareText className="h-4 w-4" />
                    OTP
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="email">Registered email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" required />
                    </div>
                    <Button className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send reset link'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="phone">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" type="tel" placeholder="+975 17 000 000" required />
                    </div>
                    <Button className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-chart-5/10">
                  <CheckCircle2 className="h-8 w-8 text-chart-5" />
                </div>
                <h2 className="text-lg font-semibold">Recovery queued</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Follow the secure reset instructions and then sign in again.
                </p>
                <Link href="/login">
                  <Button className="mt-5 w-full gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Return to sign in
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
