'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import IdentityForm from '@/components/identity-form'
import ContactResult from '@/components/contact-result'
import { Mail, Phone, AlertCircle, Loader2 } from 'lucide-react'

interface ContactResponse {
  contact: {
    primaryContatctId: number
    emails: string[]
    phoneNumbers: string[]
    secondaryContactIds: number[]
  }
}

export default function Home() {
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [result, setResult] = useState<ContactResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSetEndpoint = (endpoint: string) => {
    setApiEndpoint(endpoint)
    setShowForm(true)
    setResult(null)
    setError('')
  }

  const handleIdentify = async (email: string | null, phoneNumber: string | null) => {
    if (!apiEndpoint) {
      setError('Please set an API endpoint first')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || null,
          phoneNumber: phoneNumber || null,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to identify contact')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      {/* Header */}
      <div className="border-b border-border/30 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Bitespeed Identity Reconciliation</h1>
            <p className="text-muted-foreground text-lg">
              Enter an email and/or phone number to consolidate contact identity across multiple purchases.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Setup Column */}
          <div className="lg:col-span-2">
            <Card className="sticky top-8 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Setup</CardTitle>
                <CardDescription>Configure your API endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">API Endpoint URL</label>
                  <Input
                    placeholder="https://api.example.com/identify"
                    value={apiEndpoint}
                    onChange={(e) => {
                      setApiEndpoint(e.target.value)
                      setResult(null)
                      setError('')
                    }}
                    className="bg-input/50 border-border/50"
                  />
                </div>
                <Button
                  onClick={() => handleSetEndpoint(apiEndpoint)}
                  disabled={!apiEndpoint}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Connect API
                </Button>

                {showForm && (
                  <div className="pt-4 border-t border-border/30">
                    <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                      Test Cases
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-border/50 text-sm"
                        onClick={() => handleIdentify('lorraine@hillvalley.edu', null)}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        New Contact
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-border/50 text-sm"
                        onClick={() => handleIdentify('lorraine@email.com', null)}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Link Existing
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-border/50 text-sm"
                        onClick={() => handleIdentify(null, '+1234567890')}
                        disabled={loading}
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Merge Primary
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form and Results Column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Form Section */}
            {showForm && <IdentityForm onSubmit={handleIdentify} loading={loading} />}

            {/* Error Alert */}
            {error && (
              <Alert className="border-destructive/30 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {/* Results Section */}
            {result && <ContactResult data={result.contact} />}

            {/* Empty State */}
            {!showForm && (
              <Card className="border-border/30 bg-card/50 backdrop-blur">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Get Started</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your API endpoint to start identifying and consolidating contacts
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
