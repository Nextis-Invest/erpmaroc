'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import UserCreationForm from '@/components/admin/UserCreationForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for the form
function FormSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreateUserPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Optionally redirect to users list or show success state
    // router.push('/admin/users');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <UserCreationForm onSuccess={handleSuccess} />
      </Suspense>
    </div>
  );
}