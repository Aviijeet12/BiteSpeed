'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Link2, User, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ContactResultProps {
  data: {
    primaryContatctId: number
    emails: string[]
    phoneNumbers: string[]
    secondaryContactIds: number[]
  }
}

export default function ContactResult({ data }: ContactResultProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Primary Contact Card */}
      <Card className="border-2 border-primary/40 shadow-lg bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">Primary Contact</CardTitle>
                <Badge className="bg-primary text-primary-foreground">ID: {data.primaryContatctId}</Badge>
              </div>
              <CardDescription>Main contact profile</CardDescription>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <User className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emails Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Email Addresses ({data.emails.length})</h3>
            </div>
            <div className="space-y-2">
              {data.emails.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {idx === 0 && (
                      <Badge variant="outline" className="flex-shrink-0 border-primary/30 text-primary">
                        Primary
                      </Badge>
                    )}
                    <span className="text-sm text-foreground truncate font-mono">{email}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(email, `email-${idx}`)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-md"
                    title="Copy email"
                  >
                    {copiedId === `email-${idx}` ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Numbers Section */}
          <div className="space-y-3 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Phone Numbers ({data.phoneNumbers.length})</h3>
            </div>
            <div className="space-y-2">
              {data.phoneNumbers.length > 0 ? (
                data.phoneNumbers.map((phone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {idx === 0 && (
                        <Badge variant="outline" className="flex-shrink-0 border-primary/30 text-primary">
                          Primary
                        </Badge>
                      )}
                      <span className="text-sm text-foreground truncate font-mono">{phone}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(phone, `phone-${idx}`)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-md"
                      title="Copy phone"
                    >
                      {copiedId === `phone-${idx}` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-muted/30 text-muted-foreground text-sm text-center">
                  No phone numbers
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Contacts Card */}
      {data.secondaryContactIds.length > 0 && (
        <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-secondary/5">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">Linked Secondary Contacts</CardTitle>
                  <Badge variant="secondary">{data.secondaryContactIds.length}</Badge>
                </div>
                <CardDescription>Other contacts linked to this primary contact</CardDescription>
              </div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
                <Link2 className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.secondaryContactIds.map((id) => (
                <div
                  key={id}
                  className="p-4 rounded-lg border border-border/30 bg-secondary/10 hover:bg-secondary/20 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Contact ID
                      </p>
                      <p className="text-lg font-semibold text-foreground font-mono">{id}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(id.toString(), `secondary-${id}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-md"
                      title="Copy ID"
                    >
                      {copiedId === `secondary-${id}` ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty Secondary State */}
      {data.secondaryContactIds.length === 0 && (
        <Card className="border-border/30 bg-muted/20">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No linked secondary contacts</p>
              <p className="text-xs text-muted-foreground">This is the only contact with this identity</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/30 bg-gradient-to-br from-card to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Mail className="w-8 h-8 text-primary mx-auto opacity-60" />
              <p className="text-sm text-muted-foreground">Total Emails</p>
              <p className="text-3xl font-bold text-foreground">{data.emails.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-gradient-to-br from-card to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Phone className="w-8 h-8 text-primary mx-auto opacity-60" />
              <p className="text-sm text-muted-foreground">Total Phones</p>
              <p className="text-3xl font-bold text-foreground">{data.phoneNumbers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-gradient-to-br from-card to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Link2 className="w-8 h-8 text-primary mx-auto opacity-60" />
              <p className="text-sm text-muted-foreground">Linked Contacts</p>
              <p className="text-3xl font-bold text-foreground">{data.secondaryContactIds.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
