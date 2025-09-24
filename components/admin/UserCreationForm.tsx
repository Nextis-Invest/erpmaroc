'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Form validation schema
const userCreationSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z
    .string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  userId: z
    .string()
    .min(3, 'L\'ID utilisateur doit contenir au moins 3 caractères')
    .max(50, 'L\'ID utilisateur ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9._-]+$/, 'L\'ID utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores'),
  roleId: z
    .string()
    .min(1, 'Veuillez sélectionner un rôle'),
});

type UserCreationFormData = z.infer<typeof userCreationSchema>;

interface Role {
  _id: string;
  name: string;
  description?: string;
}

interface UserCreationFormProps {
  onSuccess?: () => void;
}

export default function UserCreationForm({ onSuccess }: UserCreationFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const form = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      name: '',
      email: '',
      userId: '',
      roleId: '',
    },
  });

  // Load roles on component mount
  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch('/api/roles');
        if (response.ok) {
          const data = await response.json();
          setRoles(data.data || []);
        } else {
          console.error('Failed to fetch roles');
          toast.error('Erreur lors du chargement des rôles');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Erreur lors du chargement des rôles');
      } finally {
        setIsLoadingRoles(false);
      }
    }

    fetchRoles();
  }, []);

  // Generate user ID suggestion based on name and email
  const generateUserIdSuggestion = (name: string, email: string) => {
    if (!name && !email) return '';

    const nameSlug = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 10);

    const emailPrefix = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 8);

    return nameSlug && emailPrefix
      ? `${nameSlug}.${emailPrefix}`
      : nameSlug || emailPrefix;
  };

  // Auto-generate userId when name or email changes
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if ((fieldName === 'name' || fieldName === 'email') && !form.getValues('userId')) {
        const suggestion = generateUserIdSuggestion(value.name || '', value.email || '');
        if (suggestion) {
          form.setValue('userId', suggestion);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(data: UserCreationFormData) {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Utilisateur créé avec succès!');

        // Show different toast based on email status
        if (result.emailSent === false) {
          toast.success('Utilisateur créé avec succès! Note: L\'email n\'a pas pu être envoyé - contactez l\'utilisateur manuellement.');
        } else {
          toast.success('Utilisateur créé avec succès! Un email de bienvenue a été envoyé.');
        }

        // Reset form
        form.reset();

        // Call success callback
        onSuccess?.();
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Erreur lors de la création de l\'utilisateur');
        toast.error(result.error || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setSubmitStatus('error');
      setSubmitMessage('Erreur de connexion. Veuillez réessayer.');
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Créer un nouvel utilisateur
        </CardTitle>
        <CardDescription>
          Créez un nouvel utilisateur et envoyez-lui un lien magique par email pour l'accès
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status Alert */}
        {submitStatus !== 'idle' && (
          <Alert className={`mb-6 ${submitStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {submitStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                {submitMessage}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jean Dupont"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jean.dupont@entreprise.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Un email de bienvenue avec un lien magique sera envoyé à cette adresse
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User ID Field */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Utilisateur *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jean.dupont"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Identifiant unique pour l'utilisateur (généré automatiquement)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Field */}
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || isLoadingRoles}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingRoles ? "Chargement des rôles..." : "Sélectionner un rôle"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.name}</span>
                            {role.description && (
                              <span className="text-sm text-muted-foreground">{role.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingRoles}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer l'utilisateur
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSubmitStatus('idle');
                  setSubmitMessage('');
                }}
                disabled={isSubmitting}
              >
                Réinitialiser
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}