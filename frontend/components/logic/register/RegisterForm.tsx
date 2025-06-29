"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function RegisterForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Erreur à l'inscription")
      }

      toast("Inscription réussie !", {
        description: "Votre compte a été créé avec succès.",
      })

      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#03001e]">
      <Card className="w-full max-w-sm border border-[#7303c0] bg-white/5 text-white backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-center text-[#ec38bc]">Inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#03001e] border-[#7303c0] text-white mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#03001e] border-[#7303c0] text-white mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#03001e] border-[#7303c0] text-white mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => 
                    setConfirmPassword(e.target.value)
                }
                className="bg-[#03001e] border-[#7303c0] text-white mt-2"
                required
              />
            </div>
                <Button
                type="submit"
                className={`w-full bg-[#7303c0] hover:bg-[#ec38bc] text-white ${
                    password !== confirmPassword ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading || password !== confirmPassword}
                >
                {loading ? "Inscription..." : "S'inscrire"}
                </Button>
            </form>
        
            <Separator className="mt-6 border-t border-[#7303c0]" />
            
            <div className="text-center text-sm text-muted-foreground mt-4">
                Tu as déjà un compte ? {" "}
                <a href="/login" className="text-[#ec38bc] hover:underline font-medium">
                    Se connecter
                </a>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
