"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Send } from "lucide-react"
import { cn } from "cn"
import { useAuth } from "@/context/AuthContext"
import { t } from "@/lib/i18n"

type Mode = "login" | "register" | "google"

interface LoginAuthProps {
  onAuthSuccess: () => void
  lang: string
}

export default function LoginAuth({ onAuthSuccess, lang }: LoginAuthProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signUpWithEmail(email, password)
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError("")
    setLoading(true)
    try {
      await signInWithGoogle()
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login com Google")
    } finally {
      setLoading(false)
    }
  }

  const tLang = (key: string) => t(key, lang)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-display">{tLang("app.name")}</h1>
          <p className="text-label">{tLang("app.tagline")}</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-md p-6 shadow-lg">
          {mode === "login" ? (
            <>
              <h2 className="text-heading mb-6">{tLang("auth.loginTitle")}</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-label">{tLang("auth.email")}</Label>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-input/50 px-3 py-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tLang("auth.emailPlaceholder")}
                      className="flex-1 bg-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-label">{tLang("auth.password")}</Label>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-input/50 px-3 py-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tLang("auth.passwordPlaceholder")}
                      className="flex-1 bg-transparent outline-none"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? tLang("auth.loading") : tLang("auth.signIn")}
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground mt-4">
                {tLang("auth.noAccount")} <button onClick={() => setMode("register")} className="text-primary underline">{tLang("auth.createAccount")}</button>
              </p>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card/90 px-2 text-muted-foreground">{tLang("auth.or")}</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleGoogle} disabled={loading}>
                <Send className="w-4 h-4" /> {tLang("auth.signInGoogle")}
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-heading mb-6">{tLang("auth.registerTitle")}</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-label">{tLang("auth.email")}</Label>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-input/50 px-3 py-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={tLang("auth.emailPlaceholder")}
                      className="flex-1 bg-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-label">{tLang("auth.password")}</Label>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-input/50 px-3 py-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tLang("auth.passwordPlaceholder")}
                      className="flex-1 bg-transparent outline-none"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? tLang("auth.loading") : tLang("auth.createAccount")}
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground mt-4">
                {tLang("auth.hasAccount")} <button onClick={() => setMode("login")} className="text-primary underline">{tLang("auth.signIn")}</button>
              </p>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card/90 px-2 text-muted-foreground">{tLang("auth.or")}</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleGoogle} disabled={loading}>
                <Send className="w-4 h-4" /> {tLang("auth.signInGoogle")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}