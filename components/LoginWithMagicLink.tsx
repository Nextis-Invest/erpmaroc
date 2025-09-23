"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Mail, Lock, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginWithMagicLink() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [magicLinkEmail, setMagicLinkEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isMagicLinkSent, setIsMagicLinkSent] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const error = searchParams.get('error')
        const registered = searchParams.get('registered')

        if (error) {
            switch(error) {
                case 'expired-token':
                    setError('Votre lien magique a expiré. Veuillez en demander un nouveau.')
                    break
                case 'invalid-token':
                    setError('Lien magique invalide. Veuillez en demander un nouveau.')
                    break
                case 'user-not-found':
                    setError('Aucun compte trouvé avec cet email.')
                    break
                case 'verification-failed':
                    setError('La vérification a échoué. Veuillez réessayer.')
                    break
                case 'magic-link-failed':
                    setError('L\'authentification par lien magique a échoué. Veuillez réessayer.')
                    break
                default:
                    setError('Une erreur s\'est produite. Veuillez réessayer.')
            }
        }

        if (registered) {
            setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        }
    }, [searchParams])

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccessMessage('')

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Email ou mot de passe invalide')
            } else {
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            setError('Une erreur s\'est produite. Veuillez réessayer.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleMagicLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccessMessage('')

        try {
            const response = await fetch('/api/auth/magic-link/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: magicLinkEmail }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsMagicLinkSent(true)
                setSuccessMessage('Vérifiez votre email ! Nous vous avons envoyé un lien magique pour vous connecter.')
            } else {
                setError(data.error || 'Échec de l\'envoi du lien magique')
            }
        } catch (error) {
            setError('Une erreur s\'est produite. Veuillez réessayer.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn('google', { callbackUrl: '/' })
        } catch (error) {
            setError('Échec de la connexion avec Google')
            setIsLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-md">
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
                        <CardTitle className="text-2xl font-bold">Bienvenue</CardTitle>
                        <CardDescription>
                            Choisissez votre méthode de connexion préférée
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                                <Sparkles className="h-4 w-4" />
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}

                        {!isMagicLinkSent ? (
                            <Tabs defaultValue="magic-link" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="magic-link" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Lien Magique
                                    </TabsTrigger>
                                    <TabsTrigger value="password" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Mot de passe
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="magic-link" className="space-y-4">
                                    <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="magic-email">Adresse email</Label>
                                            <Input
                                                id="magic-email"
                                                type="email"
                                                placeholder="nom@entreprise.com"
                                                value={magicLinkEmail}
                                                onChange={(e) => setMagicLinkEmail(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="h-11"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-base font-medium"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    <span>Envoi du lien magique...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Envoyer le lien magique
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-center text-sm text-muted-foreground">
                                            Nous vous enverrons un lien sécurisé pour vous connecter instantanément
                                        </p>
                                    </form>
                                </TabsContent>

                                <TabsContent value="password" className="space-y-4">
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Adresse email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="nom@entreprise.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password">Mot de passe</Label>
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Mot de passe oublié ?
                                                </Link>
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="h-11"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-base font-medium"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    <span>Connexion...</span>
                                                </div>
                                            ) : (
                                                'Se connecter avec mot de passe'
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Vérifiez votre email !</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Nous avons envoyé un lien magique à <strong>{magicLinkEmail}</strong>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Cliquez sur le lien dans votre email pour vous connecter. Le lien expire dans 15 minutes.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setIsMagicLinkSent(false)
                                        setMagicLinkEmail('')
                                    }}
                                >
                                    Essayer un autre email
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    {!isMagicLinkSent && (
                        <CardFooter className="flex flex-col space-y-4">
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Ou continuer avec
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11"
                                disabled={isLoading}
                                onClick={handleGoogleSignIn}
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
                                Se connecter avec Google
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Vous n&apos;avez pas de compte ?{' '}
                                <Link
                                    href="/register"
                                    className="font-medium text-primary hover:underline"
                                >
                                    S&apos;inscrire
                                </Link>
                            </p>
                        </CardFooter>
                    )}
                </Card>

                {!isMagicLinkSent && (
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        En continuant, vous acceptez nos{' '}
                        <Link href="/terms" className="underline hover:text-primary">
                            Conditions d&apos;utilisation
                        </Link>{' '}
                        et notre{' '}
                        <Link href="/privacy" className="underline hover:text-primary">
                            Politique de confidentialité
                        </Link>
                    </p>
                )}
            </div>
        </section>
    )
}