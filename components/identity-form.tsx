'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Phone, Loader2, Send } from 'lucide-react'

interface IdentityFormProps {
  onSubmit: (email: string | null, phoneNumber: string | null) => void | Promise<void>
  loading: boolean
}

export default function IdentityForm({ onSubmit, loading }: IdentityFormProps) {
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!email && !phoneNumber) {
      setValidationError('Please enter at least an email or phone number')
      return
    }

    onSubmit(email || null, phoneNumber || null)
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Identify Contact</CardTitle>
        <CardDescription>Enter email and/or phone number to find consolidated contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email Address (Optional)
            </label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-input/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Phone Number (Optional)
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              className="bg-input/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {validationError}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || (!email && !phoneNumber)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Identifying...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Identify Contact
              </>
            )}
          </Button>

          {/* Help Text */}
          <div className="p-4 rounded-md bg-accent/10 text-accent-foreground text-sm space-y-1">
            <p className="font-medium">Tip:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>At least one field (email or phone) is required</li>
              <li>Use to find linked contacts across multiple purchases</li>
              <li>Results show primary and secondary contact information</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
