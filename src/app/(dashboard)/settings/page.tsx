import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { updateUserProfile } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email || ''
  const fullName = user?.user_metadata?.full_name || ''

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Account Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={updateUserProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="mt-1" />
              <input type="hidden" name="email" value={email} />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={fullName}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button type="submit" variant="destructive">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
