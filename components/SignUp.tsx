"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        company: '',
        phone: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors: any = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Le prénom est requis'
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Le nom est requis'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'L\'email est invalide'
        }

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
        }

        if (!formData.company.trim()) {
            newErrors.company = 'Le nom de l\'entreprise est requis'
        }

        return newErrors
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    company: formData.company,
                    phone: formData.phone,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                // Registration successful
                router.push('/login?registered=true')
            } else {
                // Handle specific errors
                if (response.status === 409) {
                    setErrors({ email: 'Un compte avec cet email existe déjà' })
                } else {
                    setErrors({ general: data.error || 'L\'inscription a échoué. Veuillez réessayer.' })
                }
            }
        } catch (error) {
            console.error('Registration error:', error)
            setErrors({ general: 'Une erreur s\'est produite. Veuillez réessayer.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-2xl">
                <Card className="border-slate-200 shadow-xl dark:border-slate-800">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    ERP MAROC
                                </h1>
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 blur-lg -z-10"></div>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Créez votre compte</CardTitle>
                        <CardDescription>
                            Commencez à gérer votre entreprise plus efficacement
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {errors.general && (
                                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    {errors.general}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Prénom</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        placeholder="Jean"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className={`h-11 ${errors.firstName ? 'border-red-500' : ''}`}
                                    />
                                    {errors.firstName && (
                                        <p className="text-xs text-red-500">{errors.firstName}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nom</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="Dupont"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className={`h-11 ${errors.lastName ? 'border-red-500' : ''}`}
                                    />
                                    {errors.lastName && (
                                        <p className="text-xs text-red-500">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Adresse email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="jean@entreprise.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`h-11 ${errors.email ? 'border-red-500' : ''}`}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Nom de l&apos;entreprise</Label>
                                <Input
                                    id="company"
                                    name="company"
                                    type="text"
                                    placeholder="Votre Entreprise SARL"
                                    value={formData.company}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`h-11 ${errors.company ? 'border-red-500' : ''}`}
                                />
                                {errors.company && (
                                    <p className="text-xs text-red-500">{errors.company}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Numéro de téléphone (Optionnel)</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+212 6XX-XXXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className={`h-11 ${errors.password ? 'border-red-500' : ''}`}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-red-500">{errors.password}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className={`h-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start space-x-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    J&apos;accepte les{' '}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Conditions d&apos;utilisation
                                    </Link>{' '}
                                    et la{' '}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Politique de confidentialité
                                    </Link>
                                </Label>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Création du compte...</span>
                                    </div>
                                ) : (
                                    'Créer un compte'
                                )}
                            </Button>

                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Ou s&apos;inscrire avec
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11"
                                disabled={isLoading}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                S&apos;inscrire avec Google
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Vous avez déjà un compte ?{' '}
                                <Link
                                    href="/login"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Se connecter
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </section>
    )
}