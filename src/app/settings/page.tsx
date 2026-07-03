'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, LogOut } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  user_metadata: {
    full_name?: string
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user as UserProfile)
        setFullName(data.user.user_metadata?.full_name || '')
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      })
      // Reflect change locally
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, full_name: fullName } } : null)
    } catch {
      // silent per lazy priority
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 rounded-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="mt-1" />
          </div>
          <div>
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex-1">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}