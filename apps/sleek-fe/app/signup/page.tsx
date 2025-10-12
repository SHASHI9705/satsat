"use client"
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../firebase/AuthProvider';

type FormValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

export default function SignUpPage({ onBack }: { onBack?: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const { signUp } = useAuth();
  const { signInWithGoogle } = useAuth();

  const onSubmit = async (data: FormValues) => {
    try {
      await signUp(data.email, data.password);
      alert('Account created — demo flow');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-6 max-w-md w-full border border-black">
        <div className="mb-4 text-center">
          <Badge className="badge-brand text-black px-4 py-2">Create account</Badge>
          <h2 className="text-2xl font-bold mt-2">Sign up to SleekRoad</h2>
          
        </div>

        <div className="">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 hover:scale-105 transition-transform border border-gray-300"
            onClick={() => signInWithGoogle()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.1 0 5.9 1.2 8 3.1l6-6C34.2 3.2 29.4 1 24 1 14.6 1 6.6 6.8 3.4 15l7 5.4C12.2 13.2 17.6 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24c0-1.6-.2-3.1-.5-4.5H24v9h12.7c-1.1 3.2-3.2 5.9-6 7.7l7 5.4c4.1-3.8 6.8-9.4 6.8-15.6z"
              />
              <path
                fill="#FBBC05"
                d="M10.4 28.4c-1-3.2-1-6.6 0-9.8l-7-5.4c-2.6 5.2-2.6 11.4 0 16.6l7-5.4z"
              />
              <path
                fill="#34A853"
                d="M24 46.5c5.4 0 10.2-1.8 13.6-4.9l-7-5.4c-2 1.3-4.5 2.1-6.6 2.1-6.4 0-11.8-3.7-14.4-9.1l-7 5.4c3.2 8.2 11.2 14 21 14z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Sign up with Google
          </Button>
        </div>

        <div className="flex items-center justify-center">
          <span className="h-px w-full bg-gray-600"></span>
          <span className="px-3 text-gray-400">or</span>
          <span className="h-px w-full bg-gray-600"></span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Full name</label>
            <Input {...register('name', { required: true })} placeholder="Crazy Kumar" />
            {errors.name && <div className="text-sm text-destructive mt-1">Name is required</div>}
          </div>

          <div>
            <label className="text-sm block mb-1">University email</label>
            <Input {...register('email', { required: true })} placeholder="you@university.edu" type="email" />
            {errors.email && <div className="text-sm text-destructive mt-1">Valid email is required</div>}
          </div>

          <div>
            <label className="text-sm block mb-1">Phone Number</label>
            <Input {...register('phone', { required: true })} placeholder="+91 1234567890" type="tel" />
            {errors.phone && <div className="text-sm text-destructive mt-1">Phone number is required</div>}
          </div>

          <div>
            <label className="text-sm block mb-1">Address</label>
            <Input {...register('address', { required: true })} placeholder="Enter your address" type="text" />
            {errors.address && <div className="text-sm text-destructive mt-1">Address is required</div>}
          </div>

          <div>
            <label className="text-sm block mb-1">Password</label>
            <Input {...register('password', { required: true, minLength: 6 })} type="password" placeholder="Create a password" />
            {errors.password && <div className="text-sm text-destructive mt-1">Password must be at least 6 characters</div>}
          </div>

          <Button
            type="submit"
            variant="black"
            className="w-full hover:bg-gray-800 hover:scale-105 transition-transform"
          >
            Create account
          </Button>
        </form>
      </Card>
    </div>
  );
}