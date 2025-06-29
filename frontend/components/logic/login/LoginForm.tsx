"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
  
    const formData = new URLSearchParams()
    formData.append("username", email)  // Utiliser 'email' comme 'username' pour ton API
    formData.append("password", password)
  
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Changer le type de contenu
        },
        body: formData.toString(),  // Envoyer les données sous forme de chaîne URL-encoded
      })
  
      if (!res.ok) throw new Error("Échec de la connexion")
  
      const data = await res.json()
      const token = data.access_token
  
      // Stockage du token (localStorage ou cookie sécurisé)
      localStorage.setItem("token", token)

      router.push("/dashboard")

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#03001e]">
      <Card className="w-full max-w-sm border border-[#7303c0] bg-white/5 text-white backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-center text-[#ec38bc]">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button
              type="submit"
              className="w-full bg-[#7303c0] hover:bg-[#ec38bc] text-white"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <Separator className="mt-6 border-t border-[#7303c0]" />
            
            <div className="text-center text-sm text-muted-foreground mt-4">
                Pas encore de compte ? {" "}
                <a href="/register" className="text-[#ec38bc] hover:underline font-medium">
                    Créer un compte
                </a>
            </div>

        </CardContent>
      </Card>
    </div>
  )
}
